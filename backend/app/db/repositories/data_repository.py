"""
Production AI Agent — Domain Data Repositories
================================================
Async MongoDB repositories for managing domain data collections:
  - InventoryDataRepository (inventory_data collection)
  - ProcurementDataRepository (procurement_data collection)
  - ProductionOrderRepository (production_orders collection)
  - AIReportRepository (ai_reports collection)
"""

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)


def _sanitize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Ensure MongoDB ObjectId is converted to string for clean JSON serialization."""
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
        doc["id"] = doc["_id"]
    return doc


class InventoryDataRepository:
    """Repository for managing 'inventory_data' documents."""

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._collection = db["inventory_data"]

    async def bulk_insert(self, records: List[Dict[str, Any]]) -> int:
        """Bulk insert inventory records."""
        if not records:
            return 0
        result = await self._collection.insert_many(records)
        return len(result.inserted_ids)

    async def delete_by_upload_id(self, upload_id: str) -> int:
        """Delete all inventory records for a given upload_id."""
        result = await self._collection.delete_many({"upload_id": upload_id})
        return result.deleted_count

    async def get_all(self, limit: int = 1000) -> List[Dict[str, Any]]:
        """Retrieve latest inventory records."""
        cursor = self._collection.find().sort("snapshot_date", -1).limit(limit)
        records = await cursor.to_list(length=limit)
        return [_sanitize_doc(r) for r in records]

    async def count(self) -> int:
        """Total inventory records count."""
        return await self._collection.count_documents({})


class ProcurementDataRepository:
    """Repository for managing 'procurement_data' documents."""

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._collection = db["procurement_data"]

    async def bulk_insert(self, records: List[Dict[str, Any]]) -> int:
        """Bulk insert procurement records."""
        if not records:
            return 0
        result = await self._collection.insert_many(records)
        return len(result.inserted_ids)

    async def delete_by_upload_id(self, upload_id: str) -> int:
        """Delete all procurement records for a given upload_id."""
        result = await self._collection.delete_many({"upload_id": upload_id})
        return result.deleted_count

    async def get_all(self, limit: int = 1000) -> List[Dict[str, Any]]:
        """Retrieve latest procurement records."""
        cursor = self._collection.find().sort("snapshot_date", -1).limit(limit)
        records = await cursor.to_list(length=limit)
        return [_sanitize_doc(r) for r in records]

    async def count(self) -> int:
        """Total procurement records count."""
        return await self._collection.count_documents({})


class ProductionOrderRepository:
    """Repository for managing 'production_orders' documents."""

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._collection = db["production_orders"]

    async def bulk_insert(self, records: List[Dict[str, Any]]) -> int:
        """Bulk insert production order records."""
        if not records:
            return 0
        result = await self._collection.insert_many(records)
        return len(result.inserted_ids)

    async def delete_by_upload_id(self, upload_id: str) -> int:
        """Delete all production order records for a given upload_id."""
        result = await self._collection.delete_many({"upload_id": upload_id})
        return result.deleted_count

    async def get_all(self, limit: int = 1000) -> List[Dict[str, Any]]:
        """Retrieve latest production order records."""
        cursor = self._collection.find().sort("created_at", -1).limit(limit)
        records = await cursor.to_list(length=limit)
        return [_sanitize_doc(r) for r in records]

    async def count(self) -> int:
        """Total production orders count."""
        return await self._collection.count_documents({})


class AIReportRepository:
    """Repository for managing 'ai_reports' documents."""

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._collection = db["ai_reports"]

    async def create(self, report_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Save a new AI report document."""
        if "generated_at" not in report_dict:
            report_dict["generated_at"] = datetime.now(timezone.utc).isoformat()
        result = await self._collection.insert_one(report_dict)
        report_dict["_id"] = str(result.inserted_id)
        report_dict["id"] = str(result.inserted_id)
        return report_dict

    async def get_latest(self) -> Optional[Dict[str, Any]]:
        """Fetch the most recently generated AI report."""
        cursor = self._collection.find().sort("generated_at", -1).limit(1)
        reports = await cursor.to_list(length=1)
        if not reports:
            return None
        return _sanitize_doc(reports[0])

    async def get_all(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Fetch historical AI reports."""
        cursor = self._collection.find().sort("generated_at", -1).limit(limit)
        reports = await cursor.to_list(length=limit)
        return [_sanitize_doc(r) for r in reports]
