from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class WarehouseCreate(BaseModel):
    code: str
    name: str
    location: Optional[str] = None
    capacity: Optional[int] = 10000


class WarehouseResponse(WarehouseCreate):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StockInRequest(BaseModel):
    product_id: str
    warehouse_id: str
    quantity: int
    batch_number: Optional[str] = None
    expiry_date: Optional[datetime] = None
    reference_id: Optional[str] = None


class StockOutRequest(BaseModel):
    product_id: str
    warehouse_id: str
    quantity: int
    reference_id: Optional[str] = None


class StockAdjustmentRequest(BaseModel):
    product_id: str
    warehouse_id: str
    actual_quantity: int
    reason: Optional[str] = None


class StockTransferRequest(BaseModel):
    source_warehouse_id: str
    dest_warehouse_id: str
    product_id: str
    quantity: int


class StockBatchResponse(BaseModel):
    id: str
    batch_number: str
    quantity: int
    manufacture_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    is_expired: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InventoryItemResponse(BaseModel):
    id: str
    product_id: str
    warehouse_id: str
    quantity_on_hand: int
    quantity_allocated: int
    quantity_available: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StockTransactionResponse(BaseModel):
    id: str
    product_id: str
    warehouse_id: Optional[str] = None
    transaction_type: str
    quantity: int
    reference_id: Optional[str] = None
    performed_by_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InventoryDashboardMetrics(BaseModel):
    total_skus: int
    total_inventory_items: int
    low_stock_alerts: int
    expiring_batches_count: int
    total_stock_value: float
