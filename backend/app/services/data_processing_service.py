"""
Production AI Agent — CSV Data Ingestion & Cleaning Service
=============================================================
Parses, cleans, validates, and ingests uploaded CSV files into MongoDB.

Supported File Types:
  1. Procurement CSV -> procurement_data collection
  2. Inventory CSV -> inventory_data collection
  3. Production Orders CSV -> production_orders collection
"""

import logging
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Tuple

import pandas as pd

from app.db.repositories.data_repository import (
    InventoryDataRepository,
    ProcurementDataRepository,
    ProductionOrderRepository,
)
from app.db.repositories.upload_repository import UploadRepository
from app.models.domain import FileType, UploadStatus, ValidationError

logger = logging.getLogger(__name__)


class DataProcessingService:
    """
    Service responsible for reading stored CSV files, parsing rows into typed documents,
    performing sanity & data type validations, and storing cleaned records in MongoDB.
    """

    def __init__(
        self,
        upload_repo: UploadRepository,
        inventory_repo: InventoryDataRepository,
        procurement_repo: ProcurementDataRepository,
        production_repo: ProductionOrderRepository,
    ) -> None:
        self._upload_repo = upload_repo
        self._inventory_repo = inventory_repo
        self._procurement_repo = procurement_repo
        self._production_repo = production_repo

    def _normalize_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Normalize column names and map common aliases."""
        alias_map = {
            "quantity_on_hand": "stock_on_hand",
            "stock_qty": "stock_on_hand",
            "planned_qty": "quantity_planned",
            "produced_qty": "quantity_produced",
            "expected_delivery": "expected_delivery_date",
            "actual_delivery": "actual_delivery_date",
            "planned_start": "planned_start_date",
            "planned_end": "planned_end_date",
            "actual_start": "actual_start_date",
            "actual_end": "actual_end_date",
        }
        cols = [str(c).strip().lower().replace(" ", "_") for c in df.columns]
        df.columns = [alias_map.get(c, c) for c in cols]
        return df

    async def process_upload(self, upload_id: str) -> bool:
        """
        Main entry point to process an uploaded CSV file by upload_id.
        """
        upload = await self._upload_repo.find_by_id(upload_id)
        if not upload or not os.path.exists(upload.stored_path):
            logger.error(f"Upload record or file not found for processing: {upload_id}")
            return False

        # Mark as validating
        await self._upload_repo.update_status(upload_id, UploadStatus.VALIDATING)

        try:
            # Read CSV with pandas and normalize column aliases
            df = pd.read_csv(upload.stored_path)
            df = self._normalize_columns(df)

            errors: List[ValidationError] = []
            records: List[Dict[str, Any]] = []

            if upload.file_type == FileType.PROCUREMENT:
                records, errors = self._clean_procurement(df, upload_id)
                if not errors:
                    await self._procurement_repo.delete_by_upload_id(upload_id)
                    await self._procurement_repo.bulk_insert(records)

            elif upload.file_type == FileType.INVENTORY:
                records, errors = self._clean_inventory(df, upload_id)
                if not errors:
                    await self._inventory_repo.delete_by_upload_id(upload_id)
                    await self._inventory_repo.bulk_insert(records)

            elif upload.file_type == FileType.PRODUCTION_ORDERS:
                records, errors = self._clean_production_orders(df, upload_id)
                if not errors:
                    await self._production_repo.delete_by_upload_id(upload_id)
                    await self._production_repo.bulk_insert(records)

            # Update upload status based on validation outcome
            if errors:
                upload.status = UploadStatus.INVALID
                upload.validation_errors = errors
                await self._upload_repo.update_status(
                    upload_id, UploadStatus.INVALID, extra_fields={"validation_errors": errors}
                )
                logger.warning(f"Upload {upload_id} validation failed with {len(errors)} errors")
                return False

            upload.status = UploadStatus.PROCESSED
            upload.row_count = len(records)
            await self._upload_repo.update_status(
                upload_id, UploadStatus.PROCESSED, extra_fields={"row_count": len(records)}
            )
            logger.info(f"Upload {upload_id} successfully processed {len(records)} records")
            return True

        except Exception as exc:
            logger.exception(f"Unexpected error processing upload {upload_id}")
            await self._upload_repo.update_status(upload_id, UploadStatus.FAILED)
            return False

    def _clean_procurement(
        self, df: pd.DataFrame, upload_id: str
    ) -> Tuple[List[Dict[str, Any]], List[ValidationError]]:
        """Clean and validate procurement CSV data."""
        errors: List[ValidationError] = []
        required_cols = {"po_number", "material_id", "quantity_ordered"}
        missing = required_cols - set(df.columns)
        if missing:
            errors.append(
                ValidationError(
                    message=f"Missing required columns in Procurement CSV: {', '.join(missing)}"
                )
            )
            return [], errors

        records = []
        for idx, row in df.iterrows():
            row_num = idx + 2  # 1-indexed header offset
            try:
                qty_ord = float(row.get("quantity_ordered", 0))
                qty_rec = float(row.get("quantity_received", 0))
                unit_cost = float(row.get("unit_cost", 0.0))

                if qty_ord < 0:
                    errors.append(
                        ValidationError(
                            row=row_num,
                            column="quantity_ordered",
                            message="Quantity ordered cannot be negative",
                            value=str(qty_ord),
                        )
                    )
                    continue

                rec = {
                    "upload_id": upload_id,
                    "po_number": str(row.get("po_number", "")).strip(),
                    "supplier_name": str(row.get("supplier_name", "Unknown Supplier")).strip(),
                    "material_id": str(row.get("material_id", "")).strip(),
                    "quantity_ordered": qty_ord,
                    "quantity_received": qty_rec,
                    "unit_cost": unit_cost,
                    "total_cost": round(qty_ord * unit_cost, 2),
                    "order_date": str(row.get("order_date", "")).strip(),
                    "expected_delivery_date": str(row.get("expected_delivery_date", "")).strip(),
                    "actual_delivery_date": str(row.get("actual_delivery_date", "")).strip(),
                    "status": str(row.get("status", "pending")).strip().lower(),
                    "snapshot_date": datetime.now(timezone.utc).isoformat(),
                }
                records.append(rec)
            except Exception as e:
                errors.append(
                    ValidationError(row=row_num, message=f"Data parsing error: {str(e)}")
                )

        return records, errors

    def _clean_inventory(
        self, df: pd.DataFrame, upload_id: str
    ) -> Tuple[List[Dict[str, Any]], List[ValidationError]]:
        """Clean and validate inventory CSV data."""
        errors: List[ValidationError] = []
        required_cols = {"material_id", "stock_on_hand", "reorder_point"}
        missing = required_cols - set(df.columns)
        if missing:
            errors.append(
                ValidationError(
                    message=f"Missing required columns in Inventory CSV: {', '.join(missing)}"
                )
            )
            return [], errors

        records = []
        for idx, row in df.iterrows():
            row_num = idx + 2
            try:
                stock = float(row.get("stock_on_hand", 0))
                reserved = float(row.get("reserved_stock", 0))
                reorder = float(row.get("reorder_point", 0))
                safety = float(row.get("safety_stock", 0))
                unit_cost = float(row.get("unit_cost", 0.0))

                if stock < 0:
                    errors.append(
                        ValidationError(
                            row=row_num,
                            column="stock_on_hand",
                            message="Stock on hand cannot be negative",
                            value=str(stock),
                        )
                    )
                    continue

                available_stock = max(0.0, stock - reserved)
                stockout_risk = available_stock < reorder

                rec = {
                    "upload_id": upload_id,
                    "material_id": str(row.get("material_id", "")).strip(),
                    "material_name": str(row.get("material_name", row.get("material_id", ""))).strip(),
                    "category": str(row.get("category", "General")).strip(),
                    "warehouse_location": str(row.get("warehouse_location", "Main")).strip(),
                    "stock_on_hand": stock,
                    "reserved_stock": reserved,
                    "available_stock": available_stock,
                    "reorder_point": reorder,
                    "safety_stock": safety,
                    "unit_cost": unit_cost,
                    "total_valuation": round(stock * unit_cost, 2),
                    "stockout_risk": stockout_risk,
                    "snapshot_date": datetime.now(timezone.utc).isoformat(),
                }
                records.append(rec)
            except Exception as e:
                errors.append(
                    ValidationError(row=row_num, message=f"Data parsing error: {str(e)}")
                )

        return records, errors

    def _clean_production_orders(
        self, df: pd.DataFrame, upload_id: str
    ) -> Tuple[List[Dict[str, Any]], List[ValidationError]]:
        """Clean and validate production orders CSV data."""
        errors: List[ValidationError] = []
        required_cols = {"order_number", "quantity_planned"}
        missing = required_cols - set(df.columns)
        if missing:
            errors.append(
                ValidationError(
                    message=f"Missing required columns in Production Orders CSV: {', '.join(missing)}"
                )
            )
            return [], errors

        records = []
        for idx, row in df.iterrows():
            row_num = idx + 2
            try:
                qty_planned = float(row.get("quantity_planned", 0))
                qty_produced = float(row.get("quantity_produced", 0))

                if qty_planned <= 0:
                    errors.append(
                        ValidationError(
                            row=row_num,
                            column="quantity_planned",
                            message="Planned quantity must be greater than zero",
                            value=str(qty_planned),
                        )
                    )
                    continue

                status_val = str(row.get("status", "planned")).strip().lower()
                adherence_pct = round((qty_produced / qty_planned) * 100, 1) if qty_planned > 0 else 0.0

                rec = {
                    "upload_id": upload_id,
                    "order_number": str(row.get("order_number", "")).strip(),
                    "product_id": str(row.get("product_id", row.get("product_name", ""))).strip(),
                    "quantity_planned": qty_planned,
                    "quantity_produced": qty_produced,
                    "adherence_pct": adherence_pct,
                    "planned_start_date": str(row.get("planned_start_date", "")).strip(),
                    "planned_end_date": str(row.get("planned_end_date", "")).strip(),
                    "actual_start_date": str(row.get("actual_start_date", "")).strip(),
                    "actual_end_date": str(row.get("actual_end_date", "")).strip(),
                    "machine_id": str(row.get("machine_id", "Default Machine")).strip(),
                    "status": status_val,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
                records.append(rec)
            except Exception as e:
                errors.append(
                    ValidationError(row=row_num, message=f"Data parsing error: {str(e)}")
                )

        return records, errors
