from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict


class CarrierCreate(BaseModel):
    code: str
    company_name: str
    contact_person: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None


class CarrierResponse(CarrierCreate):
    id: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class VehicleCreate(BaseModel):
    vehicle_number: str
    carrier_id: str
    vehicle_type: str = "TRUCK"
    capacity_kg: Optional[int] = 5000


class VehicleResponse(VehicleCreate):
    id: str
    is_available: bool

    model_config = ConfigDict(from_attributes=True)


class DriverCreate(BaseModel):
    driver_code: str
    name: str
    phone: str
    license_number: str


class DriverResponse(DriverCreate):
    id: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class ShipmentCreate(BaseModel):
    origin_warehouse_id: str
    destination_address: str
    carrier_id: str
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    estimated_arrival: Optional[datetime] = None


class ShipmentStatusUpdate(BaseModel):
    shipment_id: str
    location_name: str
    status: str
    remarks: Optional[str] = None


class ShipmentResponse(BaseModel):
    id: str
    shipment_number: str
    origin_warehouse_id: str
    destination_address: str
    carrier_id: str
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    status: str
    estimated_arrival: Optional[datetime] = None
    actual_arrival: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LogisticsDashboardMetrics(BaseModel):
    total_shipments: int
    in_transit_count: int
    delivered_count: int
    on_time_delivery_rate: float
    active_vehicles: int
    return_shipments_count: int
