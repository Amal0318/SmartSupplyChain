import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Numeric, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database.session import Base


def generate_uuid():
    return str(uuid.uuid4())


class BOMHeader(Base):
    __tablename__ = "bom_headers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    bom_number = Column(String(100), unique=True, nullable=False, index=True)
    finished_good_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    version = Column(String(20), default="1.0")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    finished_good = relationship("Product")
    items = relationship("BOMItem", back_populates="bom_header")
    work_orders = relationship("WorkOrder", back_populates="bom")


class BOMItem(Base):
    __tablename__ = "bom_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    bom_header_id = Column(String(36), ForeignKey("bom_headers.id"), nullable=False)
    component_product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    quantity_required = Column(Numeric(12, 4), nullable=False, default=1.0000)
    scrap_factor = Column(Numeric(5, 2), default=0.00)

    bom_header = relationship("BOMHeader", back_populates="items")
    component = relationship("Product")


class ProductionLine(Base):
    __tablename__ = "production_lines"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    line_code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    capacity_per_hour = Column(Integer, default=100)
    is_operational = Column(Boolean, default=True)

    work_orders = relationship("WorkOrder", back_populates="line")


class WorkOrder(Base):
    __tablename__ = "work_orders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    wo_number = Column(String(100), unique=True, nullable=False, index=True)
    bom_id = Column(String(36), ForeignKey("bom_headers.id"), nullable=False)
    line_id = Column(String(36), ForeignKey("production_lines.id"), nullable=True)
    target_quantity = Column(Integer, nullable=False)
    produced_quantity = Column(Integer, default=0)
    scrap_quantity = Column(Integer, default=0)
    status = Column(String(50), default="PLANNED")  # PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    bom = relationship("BOMHeader", back_populates="work_orders")
    line = relationship("ProductionLine", back_populates="work_orders")
    consumption_logs = relationship("MaterialConsumptionLog", back_populates="work_order")


class MaterialConsumptionLog(Base):
    __tablename__ = "material_consumption_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    wo_id = Column(String(36), ForeignKey("work_orders.id"), nullable=False)
    component_product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    quantity_consumed = Column(Numeric(12, 4), nullable=False)
    logged_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    work_order = relationship("WorkOrder", back_populates="consumption_logs")
    component = relationship("Product")
