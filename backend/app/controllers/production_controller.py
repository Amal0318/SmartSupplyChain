from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.repositories.production_repository import ProductionRepository
from app.schemas.production import (
    BOMHeaderCreate, BOMHeaderResponse,
    ProductionLineCreate, ProductionLineResponse,
    WorkOrderCreate, WorkOrderResponse, WorkOrderProgressUpdate,
    ProductionDashboardMetrics
)
from app.controllers.auth_controller import get_current_user
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/production", tags=["Production & Factory Operations"])


@router.get("/dashboard/metrics", response_model=ProductionDashboardMetrics)
def get_production_metrics(db: Session = Depends(get_db)):
    repo = ProductionRepository(db)
    return repo.get_metrics()


# Bill of Materials (BOM)
@router.get("/bom", response_model=List[BOMHeaderResponse])
def list_boms(db: Session = Depends(get_db)):
    repo = ProductionRepository(db)
    return repo.get_boms()


@router.post("/bom", response_model=BOMHeaderResponse, status_code=status.HTTP_201_CREATED)
def create_bom(
    bom_in: BOMHeaderCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = ProductionRepository(db)
    return repo.create_bom(bom_in)


# Production Lines
@router.get("/lines", response_model=List[ProductionLineResponse])
def list_lines(db: Session = Depends(get_db)):
    repo = ProductionRepository(db)
    return repo.get_lines()


@router.post("/lines", response_model=ProductionLineResponse, status_code=status.HTTP_201_CREATED)
def create_line(
    line_in: ProductionLineCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = ProductionRepository(db)
    return repo.create_line(line_in)


# Work Orders
@router.get("/work-orders", response_model=List[WorkOrderResponse])
def list_work_orders(db: Session = Depends(get_db)):
    repo = ProductionRepository(db)
    return repo.get_work_orders()


@router.post("/work-orders", response_model=WorkOrderResponse, status_code=status.HTTP_201_CREATED)
def create_work_order(
    wo_in: WorkOrderCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = ProductionRepository(db)
    return repo.create_work_order(wo_in)


@router.put("/work-orders/progress", response_model=WorkOrderResponse)
def update_work_order_progress(
    update_in: WorkOrderProgressUpdate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = ProductionRepository(db)
    wo = repo.update_work_order_progress(update_in)
    if not wo:
        raise HTTPException(status_code=404, detail="Work Order not found.")
    return wo
