from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.repositories.procurement_repository import ProcurementRepository
from app.schemas.procurement import (
    PurchaseOrderCreate, PurchaseOrderResponse,
    PurchaseRequisitionCreate, PurchaseRequisitionResponse,
    RFQCreate, RFQResponse,
    SupplierQuotationCreate, SupplierQuotationResponse,
    GRNCreate, GRNResponse,
    PurchaseInvoiceCreate, PurchaseInvoiceResponse,
    ProcurementDashboardMetrics
)
from app.controllers.auth_controller import get_current_user
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/procurement", tags=["Procurement Lifecycle"])


@router.get("/dashboard/metrics", response_model=ProcurementDashboardMetrics)
def get_procurement_metrics(db: Session = Depends(get_db)):
    repo = ProcurementRepository(db)
    return repo.get_metrics()


# Purchase Requisitions & Approval Workflow
@router.get("/requisitions", response_model=List[PurchaseRequisitionResponse])
def list_requisitions(db: Session = Depends(get_db)):
    repo = ProcurementRepository(db)
    return repo.get_all_requisitions()


@router.post("/requisitions", response_model=PurchaseRequisitionResponse, status_code=status.HTTP_201_CREATED)
def create_requisition(
    pr_in: PurchaseRequisitionCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = ProcurementRepository(db)
    return repo.create_requisition(user_id=current_user.id, pr_in=pr_in)


@router.put("/requisitions/{pr_id}/approve", response_model=PurchaseRequisitionResponse)
def approve_requisition(
    pr_id: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = ProcurementRepository(db)
    pr = repo.update_requisition_status(pr_id, "APPROVED")
    if not pr:
        raise HTTPException(status_code=404, detail="Requisition not found.")
    return pr


@router.put("/requisitions/{pr_id}/reject", response_model=PurchaseRequisitionResponse)
def reject_requisition(
    pr_id: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = ProcurementRepository(db)
    pr = repo.update_requisition_status(pr_id, "REJECTED")
    if not pr:
        raise HTTPException(status_code=404, detail="Requisition not found.")
    return pr


# RFQ & Supplier Quotations
@router.get("/rfq", response_model=List[RFQResponse])
def list_rfqs(db: Session = Depends(get_db)):
    repo = ProcurementRepository(db)
    return repo.get_rfqs()


@router.post("/rfq", response_model=RFQResponse, status_code=status.HTTP_201_CREATED)
def create_rfq(
    rfq_in: RFQCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = ProcurementRepository(db)
    return repo.create_rfq(rfq_in)


@router.post("/quotations", response_model=SupplierQuotationResponse, status_code=status.HTTP_201_CREATED)
def submit_quotation(
    quote_in: SupplierQuotationCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = ProcurementRepository(db)
    return repo.create_quotation(quote_in)


# Purchase Orders
@router.get("/orders", response_model=List[PurchaseOrderResponse])
def list_orders(db: Session = Depends(get_db)):
    repo = ProcurementRepository(db)
    return repo.get_all_orders()


@router.post("/orders", response_model=PurchaseOrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    po_in: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = ProcurementRepository(db)
    return repo.create_purchase_order(user_id=current_user.id, po_in=po_in)


@router.get("/orders/{po_id}", response_model=PurchaseOrderResponse)
def get_order(po_id: str, db: Session = Depends(get_db)):
    repo = ProcurementRepository(db)
    po = repo.get_order_by_id(po_id)
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found.")
    return po


# Goods Receipt Notes (GRN)
@router.get("/grn", response_model=List[GRNResponse])
def list_grns(db: Session = Depends(get_db)):
    repo = ProcurementRepository(db)
    return repo.get_grns()


@router.post("/grn", response_model=GRNResponse, status_code=status.HTTP_201_CREATED)
def create_grn(
    grn_in: GRNCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = ProcurementRepository(db)
    return repo.create_grn(user_id=current_user.id, grn_in=grn_in)


# Invoices & Automated 3-Way Matching
@router.get("/invoices", response_model=List[PurchaseInvoiceResponse])
def list_invoices(db: Session = Depends(get_db)):
    repo = ProcurementRepository(db)
    return repo.get_invoices()


@router.post("/invoices", response_model=PurchaseInvoiceResponse, status_code=status.HTTP_201_CREATED)
def create_invoice(
    inv_in: PurchaseInvoiceCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = ProcurementRepository(db)
    return repo.create_invoice(inv_in)
