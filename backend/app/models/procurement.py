import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Numeric, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database.session import Base


def generate_uuid():
    return str(uuid.uuid4())


class PurchaseRequisition(Base):
    __tablename__ = "purchase_requisitions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    pr_number = Column(String(100), unique=True, nullable=False, index=True)
    requested_by_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="SUBMITTED")  # DRAFT, SUBMITTED, APPROVED, REJECTED, CLOSED
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    rfqs = relationship("RequestForQuotation", back_populates="requisition")
    purchase_orders = relationship("PurchaseOrder", back_populates="requisition")


class RequestForQuotation(Base):
    __tablename__ = "request_for_quotations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    rfq_number = Column(String(100), unique=True, nullable=False, index=True)
    pr_id = Column(String(36), ForeignKey("purchase_requisitions.id"), nullable=False)
    status = Column(String(50), default="OPEN")  # OPEN, QUOTED, CLOSED, CANCELLED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    requisition = relationship("PurchaseRequisition", back_populates="rfqs")
    quotations = relationship("SupplierQuotation", back_populates="rfq")


class SupplierQuotation(Base):
    __tablename__ = "supplier_quotations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    rfq_id = Column(String(36), ForeignKey("request_for_quotations.id"), nullable=False)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False)
    total_bid_amount = Column(Numeric(12, 2), nullable=False)
    lead_time_days = Column(Integer, default=7)
    status = Column(String(50), default="SUBMITTED")  # SUBMITTED, SELECTED, REJECTED
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    rfq = relationship("RequestForQuotation", back_populates="quotations")
    supplier = relationship("Supplier")


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    po_number = Column(String(100), unique=True, nullable=False, index=True)
    pr_id = Column(String(36), ForeignKey("purchase_requisitions.id"), nullable=True)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False)
    approved_by_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    status = Column(String(50), default="APPROVED")  # DRAFT, SUBMITTED, APPROVED, SENT, PARTIAL, RECEIVED, CANCELLED
    total_amount = Column(Numeric(12, 2), default=0.00)
    delivery_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    supplier = relationship("Supplier", back_populates="purchase_orders")
    requisition = relationship("PurchaseRequisition", back_populates="purchase_orders")
    items = relationship("POItem", back_populates="purchase_order")
    goods_receipts = relationship("GoodsReceiptNote", back_populates="purchase_order")
    invoices = relationship("PurchaseInvoice", back_populates="purchase_order")


class POItem(Base):
    __tablename__ = "po_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    po_id = Column(String(36), ForeignKey("purchase_orders.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Numeric(12, 2), nullable=False, default=0.00)
    total_price = Column(Numeric(12, 2), nullable=False, default=0.00)

    purchase_order = relationship("PurchaseOrder", back_populates="items")
    product = relationship("Product", back_populates="po_items")


class GoodsReceiptNote(Base):
    __tablename__ = "goods_receipt_notes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    grn_number = Column(String(100), unique=True, nullable=False, index=True)
    po_id = Column(String(36), ForeignKey("purchase_orders.id"), nullable=False)
    received_by_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    received_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(String(50), default="RECEIVED")  # RECEIVED, QC_PASSED, REJECTED
    remarks = Column(Text, nullable=True)

    purchase_order = relationship("PurchaseOrder", back_populates="goods_receipts")
    invoices = relationship("PurchaseInvoice", back_populates="grn")


class PurchaseInvoice(Base):
    __tablename__ = "purchase_invoices"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    invoice_number = Column(String(100), unique=True, nullable=False, index=True)
    po_id = Column(String(36), ForeignKey("purchase_orders.id"), nullable=False)
    grn_id = Column(String(36), ForeignKey("goods_receipt_notes.id"), nullable=True)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False)
    billed_amount = Column(Numeric(12, 2), nullable=False)
    match_status = Column(String(50), default="MATCHED")  # MATCHED, MISMATCH_HOLD
    is_paid = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    purchase_order = relationship("PurchaseOrder", back_populates="invoices")
    grn = relationship("GoodsReceiptNote", back_populates="invoices")
    supplier = relationship("Supplier")
