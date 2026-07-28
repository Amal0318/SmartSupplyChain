from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict


class SupplierCategoryCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None


class SupplierCategoryResponse(SupplierCategoryCreate):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SupplierContactCreate(BaseModel):
    supplier_id: str
    contact_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: Optional[str] = None


class SupplierContactResponse(SupplierContactCreate):
    id: str

    model_config = ConfigDict(from_attributes=True)


class SupplierBase(BaseModel):
    code: str
    company_name: str
    contact_person: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    lead_time_days: Optional[float] = 7.0
    category_id: Optional[str] = None


class SupplierCreate(SupplierBase):
    pass


class SupplierResponse(SupplierBase):
    id: str
    rating: float
    otif_rate: float
    is_active: bool
    is_deleted: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
