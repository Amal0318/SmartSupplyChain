"""
Production AI Agent — Upload Repository
=========================================
Data access layer for the 'uploads' collection.
Manages CSV upload document lifecycle in MongoDB.
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.domain import FileType, UploadModel, UploadStatus

logger = logging.getLogger(__name__)

COLLECTION = "uploads"


class UploadRepository:
    """
    Handles all CRUD operations on the 'uploads' MongoDB collection.
    """

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._collection = db[COLLECTION]

    # ---------------------------------------------------------------------------
    # Create
    # ---------------------------------------------------------------------------

    async def create(self, upload: UploadModel) -> UploadModel:
        """Insert a new upload document and return it with the generated ID."""
        document = upload.to_dict()
        result = await self._collection.insert_one(document)
        upload.id = str(result.inserted_id)
        logger.info(
            "Upload record created",
            extra={
                "upload_id": upload.id,
                "file_type": upload.file_type,
                "original_filename": upload.original_filename,
            },
        )
        return upload

    # ---------------------------------------------------------------------------
    # Read
    # ---------------------------------------------------------------------------

    async def find_by_id(self, upload_id: str) -> Optional[UploadModel]:
        """Find a single upload by its ObjectId string."""
        if not ObjectId.is_valid(upload_id):
            return None
        doc = await self._collection.find_one({"_id": ObjectId(upload_id)})
        return self._map(doc)

    async def find_by_user(
        self,
        user_id: str,
        file_type: Optional[FileType] = None,
        status: Optional[UploadStatus] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> List[UploadModel]:
        """
        List uploads for a specific user with optional filters.

        Args:
            user_id:   The uploading user's ID
            file_type: Optional filter by file type
            status:    Optional filter by processing status
            skip:      Pagination offset
            limit:     Page size

        Returns:
            List of UploadModel instances sorted by upload date descending
        """
        query: dict = {"user_id": user_id}
        if file_type:
            query["file_type"] = file_type.value
        if status:
            query["status"] = status.value

        cursor = (
            self._collection.find(query)
            .sort("uploaded_at", -1)
            .skip(skip)
            .limit(min(limit, 100))
        )
        docs = await cursor.to_list(length=min(limit, 100))
        return [self._map(doc) for doc in docs if doc]

    async def count_by_user(self, user_id: str) -> int:
        """Count total uploads for a user."""
        return await self._collection.count_documents({"user_id": user_id})

    async def find_latest_valid(self, file_type: FileType) -> Optional[UploadModel]:
        """
        Find the most recent successfully validated upload for a file type.
        Used by analysis services to pick up the latest data.
        """
        doc = await self._collection.find_one(
            {"file_type": file_type.value, "status": UploadStatus.PROCESSED.value},
            sort=[("uploaded_at", -1)],
        )
        return self._map(doc)

    # ---------------------------------------------------------------------------
    # Update
    # ---------------------------------------------------------------------------

    async def update_status(
        self,
        upload_id: str,
        status: UploadStatus,
        extra_fields: Optional[dict] = None,
    ) -> Optional[UploadModel]:
        """
        Update the status of an upload document.

        Args:
            upload_id:    Target upload ID
            status:       New UploadStatus value
            extra_fields: Additional fields to set (e.g., row_count, validation_errors)

        Returns:
            Updated UploadModel or None if not found
        """
        if not ObjectId.is_valid(upload_id):
            return None

        updates: dict = {"status": status.value}

        # Set timestamp for terminal states
        if status == UploadStatus.VALID or status == UploadStatus.INVALID:
            updates["validated_at"] = datetime.now(timezone.utc)
        elif status == UploadStatus.PROCESSED or status == UploadStatus.FAILED:
            updates["processed_at"] = datetime.now(timezone.utc)

        if extra_fields:
            updates.update(extra_fields)

        result = await self._collection.find_one_and_update(
            {"_id": ObjectId(upload_id)},
            {"$set": updates},
            return_document=True,
        )
        logger.info(
            "Upload status updated",
            extra={"upload_id": upload_id, "new_status": status.value},
        )
        return self._map(result)

    # ---------------------------------------------------------------------------
    # Private helpers
    # ---------------------------------------------------------------------------

    @staticmethod
    def _map(doc: Optional[dict]) -> Optional[UploadModel]:
        """Convert raw MongoDB document to UploadModel."""
        if doc is None:
            return None
        doc["_id"] = str(doc["_id"])
        return UploadModel.model_validate(doc)
