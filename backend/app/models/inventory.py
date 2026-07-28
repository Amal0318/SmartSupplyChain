import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Numeric, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database.session import Base


def generate_uuid():
    return str(uuid.uuid4())


class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    capacity = Column(Integer, default=10000)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    inventory_items = relationship("InventoryItem", back_populates="warehouse")


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(String(36), ForeignKey("warehouses.id"), nullable=False)
    quantity_on_hand = Column(Integer, default=0, nullable=False)
    quantity_allocated = Column(Integer, default=0, nullable=False)
    quantity_available = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    product = relationship("Product")
    warehouse = relationship("Warehouse", back_populates="inventory_items")
    batches = relationship("StockBatch", back_populates="inventory_item")


class StockBatch(Base):
    __tablename__ = "stock_batches"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    inventory_item_id = Column(String(36), ForeignKey("inventory_items.id"), nullable=False)
    batch_number = Column(String(100), nullable=False, index=True)
    quantity = Column(Integer, nullable=False, default=0)
    manufacture_date = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    is_expired = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    inventory_item = relationship("InventoryItem", back_populates="batches")


class StockTransaction(Base):
    __tablename__ = "stock_transactions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(String(36), ForeignKey("warehouses.id"), nullable=True)
    transaction_type = Column(String(50), nullable=False)  # STOCK_IN, STOCK_OUT, TRANSFER, ADJUSTMENT
    quantity = Column(Integer, nullable=False)
    reference_id = Column(String(100), nullable=True)
    performed_by_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    product = relationship("Product")
    warehouse = relationship("Warehouse")


class StockTransfer(Base):
    __tablename__ = "stock_transfers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    transfer_number = Column(String(100), unique=True, nullable=False, index=True)
    source_warehouse_id = Column(String(36), ForeignKey("warehouses.id"), nullable=False)
    dest_warehouse_id = Column(String(36), ForeignKey("warehouses.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    status = Column(String(50), default="PENDING")  # PENDING, IN_TRANSIT, COMPLETED, CANCELLED
    requested_by_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
