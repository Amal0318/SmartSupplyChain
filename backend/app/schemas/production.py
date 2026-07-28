from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class BOMItemCreate(BaseModel):
    component_product_id: str
    quantity_required: float
    scrap_factor: Optional[float] = 0.0


class BOMItemResponse(BOMItemCreate):
    id: str

    model_config = ConfigDict(from_attributes=True)


class BOMHeaderCreate(BaseModel):
    finished_good_id: str
    version: Optional[str] = "1.0"
    items: List[BOMItemCreate]


class BOMHeaderResponse(BaseModel):
    id: str
    bom_number: str
    finished_good_id: str
    version: str
    is_active: bool
    items: List[BOMItemResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductionLineCreate(BaseModel):
    line_code: str
    name: str
    capacity_per_hour: Optional[int] = 100


class ProductionLineResponse(ProductionLineCreate):
    id: str
    is_operational: bool

    model_config = ConfigDict(from_attributes=True)


class WorkOrderCreate(BaseModel):
    bom_id: str
    line_id: Optional[str] = None
    target_quantity: int


class WorkOrderProgressUpdate(BaseModel):
    wo_id: str
    produced_quantity: int
    scrap_quantity: int = 0


class WorkOrderResponse(BaseModel):
    id: str
    wo_number: str
    bom_id: str
    line_id: Optional[str] = None
    target_quantity: int
    produced_quantity: int
    scrap_quantity: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductionDashboardMetrics(BaseModel):
    total_boms: int
    active_work_orders: int
    completed_work_orders: int
    overall_equipment_effectiveness: float
    total_produced_units: int
    total_scrap_units: int
