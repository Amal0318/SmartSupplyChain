from typing import Optional, List
import uuid
from sqlalchemy.orm import Session
from app.models.procurement import (
    PurchaseOrder, POItem, PurchaseRequisition, GoodsReceiptNote,
    RequestForQuotation, SupplierQuotation, PurchaseInvoice
)
from app.schemas.procurement import (
    PurchaseOrderCreate, PurchaseRequisitionCreate,
    RFQCreate, SupplierQuotationCreate, GRNCreate, PurchaseInvoiceCreate, ProcurementDashboardMetrics
)


class ProcurementRepository:
    def __init__(self, db: Session):
        self.db = db

    # Requisitions
    def create_requisition(self, user_id: str, pr_in: PurchaseRequisitionCreate) -> PurchaseRequisition:
        count = self.db.query(PurchaseRequisition).count() + 1
        pr_number = f"PR-2026-{count:04d}"
        db_pr = PurchaseRequisition(
            pr_number=pr_number,
            requested_by_id=user_id,
            status="SUBMITTED",
            remarks=pr_in.remarks
        )
        self.db.add(db_pr)
        self.db.commit()
        self.db.refresh(db_pr)
        return db_pr

    def get_all_requisitions(self) -> List[PurchaseRequisition]:
        return self.db.query(PurchaseRequisition).all()

    def update_requisition_status(self, pr_id: str, status_str: str) -> Optional[PurchaseRequisition]:
        pr = self.db.query(PurchaseRequisition).filter(PurchaseRequisition.id == pr_id).first()
        if pr:
            pr.status = status_str
            self.db.commit()
            self.db.refresh(pr)
        return pr

    # RFQs & Supplier Quotations
    def create_rfq(self, rfq_in: RFQCreate) -> RequestForQuotation:
        count = self.db.query(RequestForQuotation).count() + 1
        rfq_number = f"RFQ-2026-{count:04d}"
        db_rfq = RequestForQuotation(rfq_number=rfq_number, pr_id=rfq_in.pr_id, status="OPEN")
        self.db.add(db_rfq)
        self.db.commit()
        self.db.refresh(db_rfq)
        return db_rfq

    def get_rfqs(self) -> List[RequestForQuotation]:
        return self.db.query(RequestForQuotation).all()

    def create_quotation(self, quote_in: SupplierQuotationCreate) -> SupplierQuotation:
        db_quote = SupplierQuotation(**quote_in.model_dump())
        self.db.add(db_quote)
        self.db.commit()
        self.db.refresh(db_quote)
        return db_quote

    # Purchase Orders
    def create_purchase_order(self, user_id: str, po_in: PurchaseOrderCreate) -> PurchaseOrder:
        count = self.db.query(PurchaseOrder).count() + 1
        po_number = f"PO-2026-{count:04d}"
        
        total_amount = sum(item.quantity * item.unit_price for item in po_in.items)

        db_po = PurchaseOrder(
            po_number=po_number,
            supplier_id=po_in.supplier_id,
            pr_id=po_in.pr_id,
            approved_by_id=user_id,
            status="APPROVED",
            total_amount=total_amount
        )
        self.db.add(db_po)
        self.db.commit()
        self.db.refresh(db_po)

        for item in po_in.items:
            db_item = POItem(
                po_id=db_po.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.unit_price,
                total_price=item.quantity * item.unit_price
            )
            self.db.add(db_item)
        
        self.db.commit()
        self.db.refresh(db_po)
        return db_po

    def get_all_orders(self) -> List[PurchaseOrder]:
        return self.db.query(PurchaseOrder).all()

    def get_order_by_id(self, po_id: str) -> Optional[PurchaseOrder]:
        return self.db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()

    # Goods Receipt Notes (GRN)
    def create_grn(self, user_id: str, grn_in: GRNCreate) -> GoodsReceiptNote:
        count = self.db.query(GoodsReceiptNote).count() + 1
        grn_number = f"GRN-2026-{count:04d}"
        db_grn = GoodsReceiptNote(
            grn_number=grn_number,
            po_id=grn_in.po_id,
            received_by_id=user_id,
            status="RECEIVED",
            remarks=grn_in.remarks
        )
        self.db.add(db_grn)

        # Update PO status to RECEIVED
        po = self.get_order_by_id(grn_in.po_id)
        if po:
            po.status = "RECEIVED"

        self.db.commit()
        self.db.refresh(db_grn)
        return db_grn

    def get_grns(self) -> List[GoodsReceiptNote]:
        return self.db.query(GoodsReceiptNote).all()

    # Invoices & Automated 3-Way Match
    def create_invoice(self, inv_in: PurchaseInvoiceCreate) -> PurchaseInvoice:
        count = self.db.query(PurchaseInvoice).count() + 1
        inv_number = f"INV-2026-{count:04d}"
        
        # 3-Way Match Validation (PO Total vs Billed Amount)
        po = self.get_order_by_id(inv_in.po_id)
        match_status = "MATCHED"
        if po and float(po.total_amount) != inv_in.billed_amount:
            match_status = "MISMATCH_HOLD"

        db_inv = PurchaseInvoice(
            invoice_number=inv_number,
            po_id=inv_in.po_id,
            grn_id=inv_in.grn_id,
            supplier_id=inv_in.supplier_id,
            billed_amount=inv_in.billed_amount,
            match_status=match_status
        )
        self.db.add(db_inv)
        self.db.commit()
        self.db.refresh(db_inv)
        return db_inv

    def get_invoices(self) -> List[PurchaseInvoice]:
        return self.db.query(PurchaseInvoice).all()

    # Procurement Dashboard Metrics
    def get_metrics(self) -> ProcurementDashboardMetrics:
        orders = self.get_all_orders()
        total_spend = sum(float(o.total_amount) for o in orders)
        mismatches = self.db.query(PurchaseInvoice).filter(PurchaseInvoice.match_status == "MISMATCH_HOLD").count()

        return ProcurementDashboardMetrics(
            total_spend=total_spend,
            total_requisitions=self.db.query(PurchaseRequisition).count(),
            total_purchase_orders=len(orders),
            open_orders=self.db.query(PurchaseOrder).filter(PurchaseOrder.status.in_(["SUBMITTED", "APPROVED", "SENT"])).count(),
            completed_grns=self.db.query(GoodsReceiptNote).count(),
            three_way_mismatches=mismatches
        )
