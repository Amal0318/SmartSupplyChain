"""
Production AI Agent — Audit Log Repository
============================================
Data access layer for the 'audit_logs' collection.
Every significant user action is recorded here.
"""

import logging
from typing import List, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.domain import AuditLogModel

logger = logging.getLogger(__name__)

COLLECTION = "audit_logs"


class AuditRepository:
    """
    Handles all write and query operations on the 'audit_logs' collection.
    Designed to be append-only — audit logs are never modified or deleted
    (except by the TTL index for retention compliance).
    """

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._collection = db[COLLECTION]

    async def log(self, entry: AuditLogModel) -> str:
        """
        Insert an audit log entry.

        Args:
            entry: AuditLogModel instance

        Returns:
            Inserted document ID as string
        """
        document = entry.to_dict()
        result = await self._collection.insert_one(document)
        return str(result.inserted_id)

    async def find_recent(
        self,
        user_id: Optional[str] = None,
        action: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[AuditLogModel]:
        """
        Query audit logs with optional filters, sorted by newest first.

        Args:
            user_id: Filter to a specific user's actions
            action:  Filter by action type (e.g., "LOGIN")
            skip:    Pagination offset
            limit:   Page size

        Returns:
            List of AuditLogModel instances
        """
        query: dict = {}
        if user_id:
            query["user_id"] = user_id
        if action:
            query["action"] = action.upper()

        cursor = (
            self._collection.find(query)
            .sort("timestamp", -1)
            .skip(skip)
            .limit(min(limit, 200))
        )
        docs = await cursor.to_list(length=min(limit, 200))
        return [self._map(doc) for doc in docs if doc]

    async def count(
        self,
        user_id: Optional[str] = None,
        action: Optional[str] = None,
    ) -> int:
        """Count audit log entries matching optional filters."""
        query: dict = {}
        if user_id:
            query["user_id"] = user_id
        if action:
            query["action"] = action.upper()
        return await self._collection.count_documents(query)

    @staticmethod
    def _map(doc: Optional[dict]) -> Optional[AuditLogModel]:
        """Convert a raw MongoDB document to AuditLogModel."""
        if doc is None:
            return None
        doc["_id"] = str(doc["_id"])
        return AuditLogModel.model_validate(doc)
