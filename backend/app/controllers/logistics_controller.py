from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.repositories.logistics_repository import LogisticsRepository
from app.schemas.logistics import (
    CarrierCreate, CarrierResponse,
    VehicleCreate, VehicleResponse,
    DriverCreate, DriverResponse,
    ShipmentCreate, ShipmentResponse, ShipmentStatusUpdate,
    LogisticsDashboardMetrics
)
from app.controllers.auth_controller import get_current_user
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/logistics", tags=["Logistics & Fleet Management"])


@router.get("/dashboard/metrics", response_model=LogisticsDashboardMetrics)
def get_logistics_metrics(db: Session = Depends(get_db)):
    repo = LogisticsRepository(db)
    return repo.get_metrics()


# Carriers
@router.get("/carriers", response_model=List[CarrierResponse])
def list_carriers(db: Session = Depends(get_db)):
    repo = LogisticsRepository(db)
    return repo.get_carriers()


@router.post("/carriers", response_model=CarrierResponse, status_code=status.HTTP_201_CREATED)
def create_carrier(
    carrier_in: CarrierCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = LogisticsRepository(db)
    return repo.create_carrier(carrier_in)


# Vehicles
@router.get("/vehicles", response_model=List[VehicleResponse])
def list_vehicles(db: Session = Depends(get_db)):
    repo = LogisticsRepository(db)
    return repo.get_vehicles()


@router.post("/vehicles", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    vehicle_in: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = LogisticsRepository(db)
    return repo.create_vehicle(vehicle_in)


# Drivers
@router.get("/drivers", response_model=List[DriverResponse])
def list_drivers(db: Session = Depends(get_db)):
    repo = LogisticsRepository(db)
    return repo.get_drivers()


@router.post("/drivers", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
def create_driver(
    driver_in: DriverCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = LogisticsRepository(db)
    return repo.create_driver(driver_in)


# Shipments & GPS Waypoint Status Updates
@router.get("/shipments", response_model=List[ShipmentResponse])
def list_shipments(db: Session = Depends(get_db)):
    repo = LogisticsRepository(db)
    return repo.get_shipments()


@router.post("/shipments", response_model=ShipmentResponse, status_code=status.HTTP_201_CREATED)
def create_shipment(
    shipment_in: ShipmentCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = LogisticsRepository(db)
    return repo.create_shipment(shipment_in)


@router.put("/shipments/status", response_model=ShipmentResponse)
def update_shipment_status(
    update_in: ShipmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = LogisticsRepository(db)
    shipment = repo.update_shipment_status(update_in)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found.")
    return shipment
