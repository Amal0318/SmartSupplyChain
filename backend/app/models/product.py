import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, Numeric, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base


def generate_uuid():
    return str(uuid.uuid4())


class ProductCategory(Base):
    __tablename__ = "product_categories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    products = relationship("Product", back_populates="category")


class ProductBrand(Base):
    __tablename__ = "product_brands"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    logo_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    products = relationship("Product", back_populates="brand")


class ProductUnit(Base):
    __tablename__ = "product_units"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(50), unique=True, nullable=False)  # Kilogram, Unit, Box, Liter
    symbol = Column(String(20), unique=True, nullable=False)  # kg, pcs, box, L
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ProductSpecification(Base):
    __tablename__ = "product_specifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    spec_key = Column(String(100), nullable=False)
    spec_value = Column(String(255), nullable=False)

    product = relationship("Product", back_populates="specifications")


class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    category_id = Column(String(36), ForeignKey("product_categories.id"), nullable=True)
    brand_id = Column(String(36), ForeignKey("product_brands.id"), nullable=True)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    unit_of_measure = Column(String(50), nullable=False, default="UNITS")
    unit_cost = Column(Numeric(12, 2), nullable=False, default=0.00)
    reorder_level = Column(Integer, nullable=False, default=10)
    safety_stock = Column(Integer, nullable=False, default=5)
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    category = relationship("ProductCategory", back_populates="products")
    brand = relationship("ProductBrand", back_populates="products")
    specifications = relationship("ProductSpecification", back_populates="product")
    po_items = relationship("POItem", back_populates="product")
