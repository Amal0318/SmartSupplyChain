from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class DemandForecastResponse(BaseModel):
    id: str
    product_id: str
    forecast_period: str
    predicted_demand_qty: int
    confidence_score: float
    algorithm_type: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ExecutiveReportCreate(BaseModel):
    title: str
    report_type: str
    parameters: Optional[str] = None


class ExecutiveReportResponse(BaseModel):
    id: str
    title: str
    report_type: str
    parameters: Optional[str] = None
    generated_by_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ExecutiveDashboardSummary(BaseModel):
    total_procurement_spend: float
    total_inventory_valuation: float
    overall_equipment_effectiveness: float
    on_time_delivery_rate: float
    vendor_otif_average: float
    active_work_orders_count: int
    low_stock_alerts_count: int
    total_employees_count: int
    system_health: str
