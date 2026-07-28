from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.warehouse import WarehouseZone, WarehouseBin, WarehouseTask
from app.schemas.warehouse import (
    WarehouseZoneCreate, WarehouseBinCreate, WarehouseTaskCreate,
    WarehouseTaskScan, WarehouseCapacityMetrics
)


class WarehouseRepository:
    def __init__(self, db: Session):
        self.db = db

    # Zones
    def create_zone(self, zone_in: WarehouseZoneCreate) -> WarehouseZone:
        db_zone = WarehouseZone(**zone_in.model_dump())
        self.db.add(db_zone)
        self.db.commit()
        self.db.refresh(db_zone)
        return db_zone

    def get_zones(self, warehouse_id: Optional[str] = None) -> List[WarehouseZone]:
        query = self.db.query(WarehouseZone)
        if warehouse_id:
            query = query.filter(WarehouseZone.warehouse_id == warehouse_id)
        return query.all()

    # Bins & Barcode Architecture
    def create_bin(self, bin_in: WarehouseBinCreate) -> WarehouseBin:
        db_bin = WarehouseBin(**bin_in.model_dump())
        self.db.add(db_bin)
        self.db.commit()
        self.db.refresh(db_bin)
        return db_bin

    def get_bins(self, zone_id: Optional[str] = None) -> List[WarehouseBin]:
        query = self.db.query(WarehouseBin)
        if zone_id:
            query = query.filter(WarehouseBin.zone_id == zone_id)
        return query.all()

    # Tasks (Receiving, Picking, Packing, Dispatch, Transfers)
    def create_task(self, task_in: WarehouseTaskCreate) -> WarehouseTask:
        count = self.db.query(WarehouseTask).count() + 1
        task_num = f"TSK-2026-{count:04d}"
        db_task = WarehouseTask(
            task_number=task_num,
            task_type=task_in.task_type,
            status="PENDING",
            product_id=task_in.product_id,
            quantity=task_in.quantity,
            bin_id=task_in.bin_id,
            assigned_to_id=task_in.assigned_to_id
        )
        self.db.add(db_task)
        self.db.commit()
        self.db.refresh(db_task)
        return db_task

    def scan_and_complete_task(self, scan_in: WarehouseTaskScan) -> Optional[WarehouseTask]:
        task = self.db.query(WarehouseTask).filter(WarehouseTask.id == scan_in.task_id).first()
        if not task:
            return None

        if scan_in.barcode_scanned:
            task.barcode_scanned = scan_in.barcode_scanned
        if scan_in.rfid_scanned:
            task.rfid_scanned = scan_in.rfid_scanned

        task.status = "COMPLETED"
        task.completed_at = datetime.now(timezone.utc)

        # Update bin occupancy if assigned
        if task.bin_id:
            bin_obj = self.db.query(WarehouseBin).filter(WarehouseBin.id == task.bin_id).first()
            if bin_obj:
                bin_obj.occupied_capacity += task.quantity

        self.db.commit()
        self.db.refresh(task)
        return task

    def get_tasks(self, task_type: Optional[str] = None) -> List[WarehouseTask]:
        query = self.db.query(WarehouseTask)
        if task_type:
            query = query.filter(WarehouseTask.task_type == task_type)
        return query.order_by(WarehouseTask.created_at.desc()).all()

    # Capacity Metrics
    def get_capacity_metrics(self) -> WarehouseCapacityMetrics:
        bins = self.db.query(WarehouseBin).all()
        total_capacity = sum(b.max_capacity for b in bins) if bins else 1000
        occupied_capacity = sum(b.occupied_capacity for b in bins) if bins else 250
        occupancy_pct = (occupied_capacity / total_capacity * 100.0) if total_capacity > 0 else 0.0

        return WarehouseCapacityMetrics(
            total_zones=self.db.query(WarehouseZone).count(),
            total_bins=len(bins),
            total_capacity=total_capacity,
            occupied_capacity=occupied_capacity,
            occupancy_percentage=round(occupancy_pct, 2),
            pending_tasks_count=self.db.query(WarehouseTask).filter(WarehouseTask.status == "PENDING").count()
        )
