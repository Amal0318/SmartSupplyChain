from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class WarehouseZoneCreate(BaseModel):
    warehouse_id: str
    name: str
    code: str
    zone_type: str = "STORAGE"


class WarehouseZoneResponse(WarehouseZoneCreate):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WarehouseBinCreate(BaseModel):
    zone_id: str
    bin_code: str
    barcode: str
    rfid_tag_id: Optional[str] = None
    max_capacity: Optional[int] = 500


class WarehouseBinResponse(WarehouseBinCreate):
    id: str
    occupied_capacity: int
    is_available: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WarehouseTaskCreate(BaseModel):
    task_type: str  # RECEIVING, PICKING, PACKING, DISPATCH, BIN_TRANSFER
    product_id: str
    quantity: int
    bin_id: Optional[str] = None
    assigned_to_id: Optional[str] = None


class WarehouseTaskScan(BaseModel):
    task_id: str
    barcode_scanned: Optional[str] = None
    rfid_scanned: Optional[str] = None


class WarehouseTaskResponse(BaseModel):
    id: str
    task_number: str
    task_type: str
    status: str
    assigned_to_id: Optional[str] = None
    bin_id: Optional[str] = None
    product_id: str
    quantity: int
    barcode_scanned: Optional[str] = None
    rfid_scanned: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class WarehouseCapacityMetrics(BaseModel):
    total_zones: int
    total_bins: int
    total_capacity: int
    occupied_capacity: int
    occupancy_percentage: float
    pending_tasks_count: int
