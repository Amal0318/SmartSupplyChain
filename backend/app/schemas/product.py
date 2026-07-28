from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class ProductCategoryCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None


class ProductCategoryResponse(ProductCategoryCreate):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductBrandCreate(BaseModel):
    name: str
    code: str
    logo_url: Optional[str] = None


class ProductBrandResponse(ProductBrandCreate):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductUnitCreate(BaseModel):
    name: str
    symbol: str


class ProductUnitResponse(ProductUnitCreate):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductSpecificationCreate(BaseModel):
    product_id: str
    spec_key: str
    spec_value: str


class ProductSpecificationResponse(ProductSpecificationCreate):
    id: str

    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    sku: str
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    unit_of_measure: str = "UNITS"
    unit_cost: float = 0.00
    reorder_level: int = 10
    safety_stock: int = 5
    category_id: Optional[str] = None
    brand_id: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: str
    is_active: bool
    is_deleted: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
