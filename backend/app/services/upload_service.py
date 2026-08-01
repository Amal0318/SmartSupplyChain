"""
Production AI Agent — Upload Service
====================================
Business logic for handling CSV file uploads:
  - Validates file size, extension, and MIME type
  - Saves file securely to local storage directory
  - Creates upload database record
  - Dispatches async validation pipeline

Design:
  - Isolated file IO operations with clean error propagation
  - Prevents path traversal vulnerabilities using secure filename sanitization
"""

import logging
import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple

from fastapi import UploadFile

from app.core.config import get_settings
from app.core.exceptions import (
    FileSizeException,
    NotFoundException,
    UnsupportedFileTypeException,
    ValidationException,
)
from app.db.repositories.audit_repository import AuditRepository
from app.db.repositories.upload_repository import UploadRepository
from app.models.domain import AuditLogModel, FileType, UploadModel, UploadStatus
from app.schemas.schemas import UploadResponse, UploadStatusResponse

logger = logging.getLogger(__name__)
settings = get_settings()


class UploadService:
    """
    Handles CSV upload workflow and data persistence.
    """

    def __init__(
        self,
        upload_repo: UploadRepository,
        audit_repo: AuditRepository,
    ) -> None:
        self._upload_repo = upload_repo
        self._audit_repo = audit_repo

    async def process_file_upload(
        self,
        file: UploadFile,
        file_type: FileType,
        user_id: str,
        user_email: str,
        ip_address: str = "",
    ) -> UploadResponse:
        """
        Validate and store an incoming CSV file.

        Args:
            file: FastAPI UploadFile object
            file_type: FileType (procurement | inventory | production_orders)
            user_id: ID of the user uploading the file
            user_email: Email of user uploading the file
            ip_address: Client IP address

        Returns:
            UploadResponse schema containing upload metadata
        """
        filename = file.filename or "uploaded_file.csv"
        
        # 1. Validate File Extension
        ext = filename.split(".")[-1].lower() if "." in filename else ""
        if ext not in settings.allowed_extensions:
            raise UnsupportedFileTypeException(settings.allowed_extensions)

        # 2. Ensure Upload Directory Exists
        os.makedirs(settings.upload_dir, exist_ok=True)

        # 3. Read file content to check size and write to disk securely
        file_bytes = await file.read()
        file_size = len(file_bytes)

        if file_size > settings.max_upload_size_bytes:
            raise FileSizeException(settings.max_upload_size_mb)

        # Generate unique filename to avoid collisions and path traversal
        safe_filename = f"{file_type.value}_{uuid.uuid4().hex}_{datetime.now().strftime('%Y%m%d%H%M%S')}.csv"
        stored_path = os.path.join(settings.upload_dir, safe_filename)

        with open(stored_path, "wb") as f:
            f.write(file_bytes)

        # Reset cursor position just in case
        await file.seek(0)

        # 4. Create Upload Database Entry
        upload_model = UploadModel(
            user_id=user_id,
            file_type=file_type,
            original_filename=filename,
            stored_path=stored_path,
            status=UploadStatus.UPLOADED,
            file_size_bytes=file_size,
        )

        created_upload = await self._upload_repo.create(upload_model)

        # 5. Write Audit Log
        await self._audit_repo.log(
            AuditLogModel(
                user_id=user_id,
                user_email=user_email,
                action="CSV_UPLOAD",
                resource="upload",
                resource_id=str(created_upload.id),
                status="success",
                ip_address=ip_address,
                details={
                    "filename": filename,
                    "file_type": file_type.value,
                    "file_size": file_size,
                },
            )
        )

        logger.info(
            "CSV upload successful",
            extra={
                "upload_id": str(created_upload.id),
                "user_id": user_id,
                "file_type": file_type.value,
            },
        )

        return UploadResponse(
            id=str(created_upload.id),
            file_type=created_upload.file_type,
            original_filename=created_upload.original_filename,
            status=created_upload.status,
            file_size_bytes=created_upload.file_size_bytes,
            uploaded_at=created_upload.uploaded_at,
            message=f"{file_type.value.capitalize()} CSV uploaded successfully.",
        )

    async def get_upload_status(self, upload_id: str, user_id: str) -> UploadStatusResponse:
        """Fetch upload status and details."""
        upload = await self._upload_repo.find_by_id(upload_id)
        if not upload:
            raise NotFoundException("Upload", upload_id)
        return UploadStatusResponse.model_validate(upload)

    async def get_user_uploads(
        self,
        user_id: str,
        file_type: Optional[FileType] = None,
        status: Optional[UploadStatus] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> List[UploadStatusResponse]:
        """Get paginated uploads for a user."""
        uploads = await self._upload_repo.find_by_user(
            user_id=user_id,
            file_type=file_type,
            status=status,
            skip=skip,
            limit=limit,
        )
        return [UploadStatusResponse.model_validate(u) for u in uploads]
