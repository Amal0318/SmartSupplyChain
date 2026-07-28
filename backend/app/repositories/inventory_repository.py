from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.inventory import Warehouse, InventoryItem, StockBatch, StockTransaction, StockTransfer
from app.models.product import Product
from app.schemas.inventory import (
    WarehouseCreate, StockInRequest, StockOutRequest,
    StockAdjustmentRequest, StockTransferRequest, InventoryDashboardMetrics
)


class InventoryRepository:
    def __init__(self, db: Session):
        self.db = db

    # Warehouse CRUD
    def create_warehouse(self, wh_in: WarehouseCreate) -> Warehouse:
        db_wh = Warehouse(**wh_in.model_dump())
        self.db.add(db_wh)
        self.db.commit()
        self.db.refresh(db_wh)
        return db_wh

    def get_warehouses(self) -> List[Warehouse]:
        return self.db.query(Warehouse).all()

    # Get or create inventory balance record
    def _get_or_create_item(self, product_id: str, warehouse_id: str) -> InventoryItem:
        item = self.db.query(InventoryItem).filter(
            InventoryItem.product_id == product_id,
            InventoryItem.warehouse_id == warehouse_id
        ).first()

        if not item:
            item = InventoryItem(
                product_id=product_id,
                warehouse_id=warehouse_id,
                quantity_on_hand=0,
                quantity_allocated=0,
                quantity_available=0
            )
            self.db.add(item)
            self.db.commit()
            self.db.refresh(item)

        return item

    # Stock In
    def stock_in(self, user_id: str, req: StockInRequest) -> InventoryItem:
        item = self._get_or_create_item(req.product_id, req.warehouse_id)
        item.quantity_on_hand += req.quantity
        item.quantity_available += req.quantity

        # Batch tracking
        if req.batch_number:
            batch = StockBatch(
                inventory_item_id=item.id,
                batch_number=req.batch_number,
                quantity=req.quantity,
                expiry_date=req.expiry_date
            )
            self.db.add(batch)

        # Audit Transaction
        tx = StockTransaction(
            product_id=req.product_id,
            warehouse_id=req.warehouse_id,
            transaction_type="STOCK_IN",
            quantity=req.quantity,
            reference_id=req.reference_id,
            performed_by_id=user_id
        )
        self.db.add(tx)

        self.db.commit()
        self.db.refresh(item)
        return item

    # Stock Out
    def stock_out(self, user_id: str, req: StockOutRequest) -> InventoryItem:
        item = self._get_or_create_item(req.product_id, req.warehouse_id)
        if item.quantity_available < req.quantity:
            raise ValueError(f"Insufficient available inventory. Current available: {item.quantity_available}")

        item.quantity_on_hand -= req.quantity
        item.quantity_available -= req.quantity

        tx = StockTransaction(
            product_id=req.product_id,
            warehouse_id=req.warehouse_id,
            transaction_type="STOCK_OUT",
            quantity=req.quantity,
            reference_id=req.reference_id,
            performed_by_id=user_id
        )
        self.db.add(tx)

        self.db.commit()
        self.db.refresh(item)
        return item

    # Stock Adjustment
    def stock_adjustment(self, user_id: str, req: StockAdjustmentRequest) -> InventoryItem:
        item = self._get_or_create_item(req.product_id, req.warehouse_id)
        variance = req.actual_quantity - item.quantity_on_hand

        item.quantity_on_hand = req.actual_quantity
        item.quantity_available = req.actual_quantity - item.quantity_allocated

        tx = StockTransaction(
            product_id=req.product_id,
            warehouse_id=req.warehouse_id,
            transaction_type="ADJUSTMENT",
            quantity=variance,
            reference_id=req.reason or "Physical Count Adjustment",
            performed_by_id=user_id
        )
        self.db.add(tx)

        self.db.commit()
        self.db.refresh(item)
        return item

    # Stock Transfer
    def create_transfer(self, user_id: str, req: StockTransferRequest) -> StockTransfer:
        count = self.db.query(StockTransfer).count() + 1
        transfer_num = f"TRF-2026-{count:04d}"

        # Deduct from source warehouse
        self.stock_out(user_id, StockOutRequest(
            product_id=req.product_id,
            warehouse_id=req.source_warehouse_id,
            quantity=req.quantity,
            reference_id=transfer_num
        ))

        # Add to destination warehouse
        self.stock_in(user_id, StockInRequest(
            product_id=req.product_id,
            warehouse_id=req.dest_warehouse_id,
            quantity=req.quantity,
            reference_id=transfer_num
        ))

        db_trf = StockTransfer(
            transfer_number=transfer_num,
            source_warehouse_id=req.source_warehouse_id,
            dest_warehouse_id=req.dest_warehouse_id,
            product_id=req.product_id,
            quantity=req.quantity,
            status="COMPLETED",
            requested_by_id=user_id
        )
        self.db.add(db_trf)
        self.db.commit()
        self.db.refresh(db_trf)
        return db_trf

    def get_inventory_items(self) -> List[InventoryItem]:
        return self.db.query(InventoryItem).all()

    def get_transactions(self) -> List[StockTransaction]:
        return self.db.query(StockTransaction).order_by(StockTransaction.created_at.desc()).all()

    # Inventory Metrics
    def get_metrics(self) -> InventoryDashboardMetrics:
        items = self.get_inventory_items()
        low_stock_count = 0
        total_value = 0.0

        for item in items:
            product = self.db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                total_value += float(product.unit_cost) * item.quantity_on_hand
                if item.quantity_available <= product.reorder_level:
                    low_stock_count += 1

        expiring_count = self.db.query(StockBatch).filter(StockBatch.is_expired == True).count()

        return InventoryDashboardMetrics(
            total_skus=self.db.query(Product).count(),
            total_inventory_items=len(items),
            low_stock_alerts=low_stock_count,
            expiring_batches_count=expiring_count,
            total_stock_value=total_value
        )
