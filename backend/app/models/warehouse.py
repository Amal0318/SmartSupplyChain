import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database.session import Base


def generate_uuid():
    return str(uuid.uuid4())


class WarehouseZone(Base):
    __tablename__ = "warehouse_zones"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    warehouse_id = Column(String(36), ForeignKey("warehouses.id"), nullable=False)
    name = Column(String(100), nullable=False)
    code = Column(String(50), nullable=False)
    zone_type = Column(String(50), default="STORAGE")  # RECEIVING, STORAGE, PICKING, PACKING, STAGING, QUARANTINE
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    warehouse = relationship("Warehouse")
    bins = relationship("WarehouseBin", back_populates="zone")


class WarehouseBin(Base):
    __tablename__ = "warehouse_bins"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    zone_id = Column(String(36), ForeignKey("warehouse_zones.id"), nullable=False)
    bin_code = Column(String(100), unique=True, nullable=False, index=True)  # e.g., ZONE-A-RACK-01-BIN-102
    barcode = Column(String(100), unique=True, nullable=False, index=True)
    rfid_tag_id = Column(String(100), unique=True, nullable=True)  # Future RFID Support
    max_capacity = Column(Integer, default=500)
    occupied_capacity = Column(Integer, default=0)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    zone = relationship("WarehouseZone", back_populates="bins")
    tasks = relationship("WarehouseTask", back_populates="bin")


class WarehouseTask(Base):
    __tablename__ = "warehouse_tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    task_number = Column(String(100), unique=True, nullable=False, index=True)
    task_type = Column(String(50), nullable=False)  # RECEIVING, PICKING, PACKING, DISPATCH, BIN_TRANSFER
    status = Column(String(50), default="PENDING")  # PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    assigned_to_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    bin_id = Column(String(36), ForeignKey("warehouse_bins.id"), nullable=True)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    barcode_scanned = Column(String(100), nullable=True)  # Scanned verification payload
    rfid_scanned = Column(String(100), nullable=True)    # Scanned RFID payload
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    bin = relationship("WarehouseBin", back_populates="tasks")
    product = relationship("Product")
