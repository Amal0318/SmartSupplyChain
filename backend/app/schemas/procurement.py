from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class RFQCreate(BaseModel):
    pr_id: str


class RFQResponse(BaseModel):
    id: str
    rfq_number: str
    pr_id: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SupplierQuotationCreate(BaseModel):
    rfq_id: str
    supplier_id: str
    total_bid_amount: float
    lead_time_days: int = 7


class SupplierQuotationResponse(SupplierQuotationCreate):
    id: str
    status: str
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GRNCreate(BaseModel):
    po_id: str
    remarks: Optional[str] = None


class GRNResponse(BaseModel):
    id: str
    grn_number: str
    po_id: str
    received_by_id: str
    status: str
    remarks: Optional[str] = None
    received_date: datetime

    model_config = ConfigDict(from_attributes=True)


class PurchaseInvoiceCreate(BaseModel):
    po_id: str
    grn_id: Optional[str] = None
    supplier_id: str
    billed_amount: float


class PurchaseInvoiceResponse(BaseModel):
    id: str
    invoice_number: str
    po_id: str
    grn_id: Optional[str] = None
    supplier_id: str
    billed_amount: float
    match_status: str
    is_paid: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class POItemCreate(BaseModel):
    product_id: str
    quantity: int
    unit_price: float


class POItemResponse(POItemCreate):
    id: str
    total_price: float

    model_config = ConfigDict(from_attributes=True)


class PurchaseOrderCreate(BaseModel):
    supplier_id: str
    pr_id: Optional[str] = None
    items: List[POItemCreate]
    remarks: Optional[str] = None


class PurchaseOrderResponse(BaseModel):
    id: str
    po_number: str
    supplier_id: str
    status: str
    total_amount: float
    items: List[POItemResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PurchaseRequisitionCreate(BaseModel):
    remarks: Optional[str] = None


class PurchaseRequisitionResponse(BaseModel):
    id: str
    pr_number: str
    requested_by_id: str
    status: str
    remarks: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProcurementDashboardMetrics(BaseModel):
    total_spend: float
    total_requisitions: int
    total_purchase_orders: int
    open_orders: int
    completed_grns: int
    three_way_mismatches: int
