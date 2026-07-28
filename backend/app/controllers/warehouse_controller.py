from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.repositories.warehouse_repository import WarehouseRepository
from app.schemas.warehouse import (
    WarehouseZoneCreate, WarehouseZoneResponse,
    WarehouseBinCreate, WarehouseBinResponse,
    WarehouseTaskCreate, WarehouseTaskResponse, WarehouseTaskScan,
    WarehouseCapacityMetrics
)
from app.controllers.auth_controller import get_current_user
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/warehouse-operations", tags=["Warehouse Operations & Bin Management"])


@router.get("/capacity/metrics", response_model=WarehouseCapacityMetrics)
def get_warehouse_metrics(db: Session = Depends(get_db)):
    repo = WarehouseRepository(db)
    return repo.get_capacity_metrics()


# Zones
@router.get("/zones", response_model=List[WarehouseZoneResponse])
def list_zones(warehouse_id: Optional[str] = None, db: Session = Depends(get_db)):
    repo = WarehouseRepository(db)
    return repo.get_zones(warehouse_id)


@router.post("/zones", response_model=WarehouseZoneResponse, status_code=status.HTTP_201_CREATED)
def create_zone(
    zone_in: WarehouseZoneCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = WarehouseRepository(db)
    return repo.create_zone(zone_in)


# Bins & Barcode Architecture
@router.get("/bins", response_model=List[WarehouseBinResponse])
def list_bins(zone_id: Optional[str] = None, db: Session = Depends(get_db)):
    repo = WarehouseRepository(db)
    return repo.get_bins(zone_id)


@router.post("/bins", response_model=WarehouseBinResponse, status_code=status.HTTP_201_CREATED)
def create_bin(
    bin_in: WarehouseBinCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = WarehouseRepository(db)
    return repo.create_bin(bin_in)


# Tasks (Receiving, Picking, Packing, Dispatch, Bin Transfers)
@router.get("/tasks", response_model=List[WarehouseTaskResponse])
def list_tasks(task_type: Optional[str] = None, db: Session = Depends(get_db)):
    repo = WarehouseRepository(db)
    return repo.get_tasks(task_type)


@router.post("/tasks", response_model=WarehouseTaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: WarehouseTaskCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = WarehouseRepository(db)
    return repo.create_task(task_in)


# Barcode & RFID Scanning Execution Endpoint
@router.post("/tasks/scan", response_model=WarehouseTaskResponse)
def scan_and_complete_task(
    scan_in: WarehouseTaskScan,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = WarehouseRepository(db)
    task = repo.scan_and_complete_task(scan_in)
    if not task:
        raise HTTPException(status_code=404, detail="Warehouse task not found.")
    return task
