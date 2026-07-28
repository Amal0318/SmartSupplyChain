import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base


def generate_uuid():
    return str(uuid.uuid4())


class SupplierCategory(Base):
    __tablename__ = "supplier_categories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    suppliers = relationship("Supplier", back_populates="category")


class SupplierContact(Base):
    __tablename__ = "supplier_contacts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False)
    contact_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(50), nullable=True)  # Account Manager, Sales Rep, Logistics

    supplier = relationship("Supplier", back_populates="contacts")


class SupplierPerformanceMetric(Base):
    __tablename__ = "supplier_performance_metrics"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False)
    otif_score = Column(Numeric(5, 2), default=95.0)
    defect_rate = Column(Numeric(5, 2), default=1.0)
    lead_time_variance = Column(Numeric(5, 2), default=0.0)
    evaluation_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    supplier = relationship("Supplier", back_populates="performance_metrics")


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    category_id = Column(String(36), ForeignKey("supplier_categories.id"), nullable=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    company_name = Column(String(255), nullable=False)
    contact_person = Column(String(100), nullable=True)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    rating = Column(Numeric(3, 2), default=5.00)
    lead_time_days = Column(Numeric(5, 2), default=7.0)
    otif_rate = Column(Numeric(5, 2), default=95.0)
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    category = relationship("SupplierCategory", back_populates="suppliers")
    contacts = relationship("SupplierContact", back_populates="supplier")
    performance_metrics = relationship("SupplierPerformanceMetric", back_populates="supplier")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")
