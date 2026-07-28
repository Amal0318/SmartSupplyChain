from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.repositories.inventory_repository import InventoryRepository
from app.schemas.inventory import (
    WarehouseCreate, WarehouseResponse,
    StockInRequest, StockOutRequest, StockAdjustmentRequest, StockTransferRequest,
    InventoryItemResponse, StockTransactionResponse, InventoryDashboardMetrics
)
from app.controllers.auth_controller import get_current_user
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/inventory", tags=["Inventory & Stock Management"])


@router.get("/dashboard/metrics", response_model=InventoryDashboardMetrics)
def get_inventory_metrics(db: Session = Depends(get_db)):
    repo = InventoryRepository(db)
    return repo.get_metrics()


@router.get("/warehouses", response_model=List[WarehouseResponse])
def list_warehouses(db: Session = Depends(get_db)):
    repo = InventoryRepository(db)
    return repo.get_warehouses()


@router.post("/warehouses", response_model=WarehouseResponse, status_code=status.HTTP_201_CREATED)
def create_warehouse(
    wh_in: WarehouseCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = InventoryRepository(db)
    return repo.create_warehouse(wh_in)


@router.get("/items", response_model=List[InventoryItemResponse])
def list_inventory_items(db: Session = Depends(get_db)):
    repo = InventoryRepository(db)
    return repo.get_inventory_items()


@router.post("/stock-in", response_model=InventoryItemResponse)
def stock_in(
    req: StockInRequest,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = InventoryRepository(db)
    return repo.stock_in(current_user.id, req)


@router.post("/stock-out", response_model=InventoryItemResponse)
def stock_out(
    req: StockOutRequest,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = InventoryRepository(db)
    try:
        return repo.stock_out(current_user.id, req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/adjustment", response_model=InventoryItemResponse)
def stock_adjustment(
    req: StockAdjustmentRequest,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = InventoryRepository(db)
    return repo.stock_adjustment(current_user.id, req)


@router.post("/transfers")
def create_transfer(
    req: StockTransferRequest,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = InventoryRepository(db)
    return repo.create_transfer(current_user.id, req)


@router.get("/transactions", response_model=List[StockTransactionResponse])
def list_transactions(db: Session = Depends(get_db)):
    repo = InventoryRepository(db)
    return repo.get_transactions()
