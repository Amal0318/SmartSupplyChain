"""
Production AI Agent — MongoDB Connection & Database Manager
============================================================
Manages the async MongoDB connection lifecycle using Motor.

Design:
  - Single client instance shared across the application lifetime
  - Async context manager for clean startup / shutdown
  - Exposes helper to get the DB instance anywhere in the app
  - Creates required indexes on startup for performance
"""

import logging
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import OperationFailure

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class MongoDB:
    """
    MongoDB connection manager.

    Holds the singleton Motor client and database reference.
    Indexes are created during connect() to guarantee query performance.
    """

    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None

    async def connect(self) -> None:
        """
        Open the MongoDB connection and create performance indexes.
        Called once during FastAPI startup.
        """
        logger.info(
            "Connecting to MongoDB",
            extra={"url": settings.mongodb_url, "db": settings.mongodb_db_name},
        )
        self.client = AsyncIOMotorClient(
            settings.mongodb_url,
            serverSelectionTimeoutMS=5000,   # Fail fast if Mongo is unreachable
            maxPoolSize=10,
            minPoolSize=2,
        )
        self.db = self.client[settings.mongodb_db_name]

        # Validate connection with a ping
        await self.client.admin.command("ping")
        logger.info("MongoDB connection established successfully")

        # Create indexes for all collections
        await self._create_indexes()

    async def disconnect(self) -> None:
        """
        Close the MongoDB connection.
        Called once during FastAPI shutdown.
        """
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed")

    async def _create_indexes(self) -> None:
        """
        Create all required indexes.
        Uses create_index with sparse/unique flags for optimal performance.
        Idempotent — safe to call on every restart.
        """
        db = self.db

        # users
        await db["users"].create_index("email", unique=True)
        await db["users"].create_index("role")
        await db["users"].create_index("is_active")

        # uploads
        await db["uploads"].create_index("user_id")
        await db["uploads"].create_index("file_type")
        await db["uploads"].create_index("status")
        await db["uploads"].create_index("uploaded_at")

        # inventory_data
        await db["inventory_data"].create_index("upload_id")
        await db["inventory_data"].create_index("material_id")
        await db["inventory_data"].create_index("snapshot_date")

        # procurement_data
        await db["procurement_data"].create_index("upload_id")
        await db["procurement_data"].create_index("material_id")
        await db["procurement_data"].create_index("po_number", unique=True, sparse=True)
        await db["procurement_data"].create_index("snapshot_date")

        # production_orders
        await db["production_orders"].create_index("order_number", unique=True, sparse=True)
        await db["production_orders"].create_index("status")
        await db["production_orders"].create_index("machine_id")
        await db["production_orders"].create_index("snapshot_date")

        # analysis_reports
        await db["analysis_reports"].create_index("generated_by")
        await db["analysis_reports"].create_index("generated_at")
        await db["analysis_reports"].create_index("report_type")

        # ai_reports
        await db["ai_reports"].create_index("analysis_report_id")
        await db["ai_reports"].create_index("generated_at")

        # audit_logs
        await db["audit_logs"].create_index("user_id")
        await db["audit_logs"].create_index("action")
        # TTL index: auto-delete audit logs older than 2 years (63072000 seconds)
        try:
            await db["audit_logs"].create_index(
                "timestamp", expireAfterSeconds=63072000, name="audit_logs_ttl"
            )
        except OperationFailure:
            # Handle conflict if non-TTL 'timestamp_1' index already exists in database
            await db["audit_logs"].drop_index("timestamp_1")
            await db["audit_logs"].create_index(
                "timestamp", expireAfterSeconds=63072000, name="audit_logs_ttl"
            )

        logger.info("MongoDB indexes created/verified")


# ---------------------------------------------------------------------------
# Global singleton instance
# ---------------------------------------------------------------------------
mongo_manager = MongoDB()


def get_database() -> AsyncIOMotorDatabase:
    """
    FastAPI dependency to get the active database instance.

    Usage in endpoint:
        db: AsyncIOMotorDatabase = Depends(get_database)
    """
    if mongo_manager.db is None:
        raise RuntimeError("Database not initialized. Was connect() called?")
    return mongo_manager.db
