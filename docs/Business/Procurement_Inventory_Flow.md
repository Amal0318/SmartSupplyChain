# 🔄 Procurement & Inventory End-to-End Business Flow

> **Complete Business Flow, Events, Edge Cases, Roles & Responsibilities**

![Procurement & Inventory End-to-End Flow](file:///d:/Programs/SmartySupplyChain/diagrams/Department%20Flows/procurement_inventory_flow.jpg)

---

## 1. 🎯 Module Overview & Objectives

The Procurement & Inventory module ensures right materials are procured at the right time, maintained in optimal quantity, and available for production/operations.

### Key Objectives:
- Ensure uninterrupted material availability
- Maintain optimal inventory levels & safety stock
- Reduce overall procurement costs & lead times
- Improve supplier performance & vendor compliance
- Ensure inventory accuracy, stock traceability, and 3-way matching

---

## 2. 🏢 Roles & Responsibilities Matrix

| Role | Responsibilities |
| :--- | :--- |
| **Warehouse Manager (Inventory Controller)** | Monitor stock levels, raise Purchase Requisitions (PR), manage inventory operations, authorize stock issues. |
| **Procurement Executive** | Create RFQs, generate Purchase Orders (PO), manage supplier communication & follow-ups. |
| **Procurement Manager** | Review and approve PRs & POs, evaluate quotations, finalize supplier selection. |
| **Supplier / Vendor** | Confirm POs, prepare & dispatch goods, provide shipment tracking & Advance Shipping Notices (ASN). |
| **Quality Inspector** | Inspect incoming materials against quality standards; issue Quality Inspection Reports (Accepted / Rejected / Partial). |
| **Warehouse Staff** | Receive physical goods, generate Goods Receipt Notes (GRN), store items in assigned racks/bins, issue materials. |
| **Finance Team** | Receive supplier invoices, execute 3-way match (PO + GRN + Invoice), process supplier payment vouchers. |
| **System Admin** | Manage system configuration, master data (Products, Warehouses, Suppliers), user accounts & Role-Based Access Control (RBAC). |

---

## 3. 📄 Key Documents & Artifacts

- **PR (Purchase Requisition)**: Internal request to purchase materials.
- **RFQ (Request for Quotation)**: Inquiry sent to suppliers for pricing, payment, and delivery terms.
- **PO (Purchase Order)**: Legal commercial order contract issued to selected supplier.
- **GRN (Goods Receipt Note)**: Document recording arrival and physical count of goods at warehouse dock.
- **QC (Quality Inspection Report)**: Pass/Fail/Partial inspection results issued by Quality Inspector.
- **SRN (Supplier Return Note)**: Official return document generated for rejected goods.
- **IV (Supplier Invoice)**: Bill issued by supplier for delivered goods.
- **PAY (Payment Voucher)**: Disbursement proof issued after financial 3-way matching.

---

## 4. 🔄 End-to-End Business Process Flow

```
┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│  A. Need Identification   │ ───► │        B. Approval        │ ───► │      C. Sourcing & PO     │
│   & Purchase Requisition  │      │         Workflow          │      │         Creation          │
└───────────────────────────┘      └───────────────────────────┘      └─────────────┬─────────────┘
                                                                                    │
┌───────────────────────────┐      ┌───────────────────────────┐                    │
│   G. Stock Usage &        │ ◄─── │  F. Inventory Update &    │ ◄─── ┌─────────────┴─────────────┐
│   Continuous Monitoring   │      │        Warehouse Storage  │      │   D. Supplier Execution   │
└───────────────────────────┘      └───────────────────────────┘      │        & Delivery         │
                                                 ▲                    └─────────────┬─────────────┘
                                                 │                                  │
                                       (Inspection Result)                          │
                                                 │                                  │
                                   ┌─────────────┴─────────────┐                    │
                                   │   E. Receipt & Quality    │ ◄──────────────────┘
                                   │         Inspection        │
                                   └───────────────────────────┘
```

### Stage A: Need Identification & Purchase Requisition (Steps 1–4)
1. **Stock Monitoring**: System & Inventory Controller track stock levels continuously.
2. **Reorder Threshold**: Triggered when `Stock Quantity <= Reorder Level`.
3. **PR Creation**: Inventory Controller drafts Purchase Requisition (PR) with line items, quantities, and required delivery date.
4. **PR Submission**: PR submitted to approval workflow.

### Stage B: Approval Workflow (Steps 5–8)
5. **PR Review**: Procurement Manager evaluates PR against department budgets and requirements.
6. **Decision**:
   - **Reject**: PR returned to requester with remarks (Status: *Rejected*).
   - **Approve**: PR approved for sourcing (Status: *Approved*).

### Stage C: Sourcing & Purchase Order (Steps 9–15)
7. **Create RFQ**: Procurement Executive generates RFQ from approved PR.
8. **Dispatch RFQ**: Sent to qualified suppliers.
9. **Quotations Received**: Supplier bids collected & evaluated on price, quality, and lead time.
10. **Supplier Selection**: Best vendor selected based on evaluation score.
11. **Create PO**: Purchase Order generated with line items, agreed unit prices, payment terms, and delivery address.
12. **Approve PO**: Procurement Manager reviews and signs PO.
13. **Dispatch PO**: Official PO issued to selected supplier.

### Stage D: Supplier Execution & Transit (Steps 16–19)
14. **PO Confirmation**: Supplier confirms acceptance of PO terms.
15. **Dispatch & Tracking**: Supplier dispatches shipment and inputs tracking/shipping details.
16. **Goods in Transit**: Order status updated to *In Transit*.

### Stage E: Goods Receipt & Quality Inspection (Steps 20–23)
17. **Goods Received**: Warehouse Staff receives physical package at unloading dock.
18. **Create GRN**: Goods Receipt Note generated with received quantity count.
19. **Quality Inspection**: Quality Inspector checks goods against specification criteria:
    - **Accept All**: Full quantity accepted $\rightarrow$ Proceed to Inventory Update (24A).
    - **Reject All**: Full quantity rejected $\rightarrow$ Generate SRN & return goods to supplier (24B).
    - **Partial Accept**: Accepted portion sent to inventory (24C); rejected portion returned via SRN (24B).

### Stage F: Inventory Update & Storage (Steps 24–25)
20. **Stock Update**: System updates available inventory balance with accepted quantity.
21. **Putaway / Storage**: Warehouse Staff places physical stock into assigned warehouse zone, rack, and bin locations.

### Stage G: Stock Usage & Continuous Monitoring (Steps 26–30)
22. **Stock Availability**: Inventory made available for production orders or sales fulfillment.
23. **Material Issue**: Goods issued against Work Orders / Material Requests $\rightarrow$ Stock balance reduced.
24. **Continuous Audit**: System checks stock balance $\rightarrow$ Loop back to Stage A when reorder level is breached.

---

## 5. ⚠️ Edge Case Events & System Handling (E1 – E15)

| Event ID | Event Name | Trigger / Scenario | System Action & Resolution |
| :--- | :--- | :--- | :--- |
| **E1** | PR Rejected | Manager denies requisition. | PR marked *Rejected*; notification sent to requester with explanation. |
| **E2** | PR Cancelled | Requester cancels PR. | PR marked *Cancelled*; process terminated before RFQ. |
| **E3** | RFQ No Response | Suppliers fail to quote within deadline. | System alert generated; Procurement Executive re-issues RFQ to alternate vendors. |
| **E4** | All Quotes High | Bids exceed budget allowance. | Re-negotiate terms or request budget re-approval. |
| **E5** | PO Modification | Change in order qty, price, or delivery date. | PO amended with revision history (PO v1.1); re-sent to supplier. |
| **E6** | PO Cancellation | Order cancelled before dispatch. | Status set to *Cancelled*; supplier notified; open commitments freed. |
| **E7** | Partial Shipment | Supplier ships order in multiple batches. | Multiple GRNs linked to single PO; PO remains *Open / Partial* until final GRN. |
| **E8** | Delayed Delivery | Expected delivery date breached. | Automated delay alert; vendor score penalized in supplier evaluation. |
| **E9** | Quantity Shortage | Delivered qty < Ordered qty. | GRN records variance; PO status updated to *Partially Received*. |
| **E10** | Quality Rejection | Delivered goods fail QC standards. | Quality Inspection Report set to *Rejected*; inventory is **NOT** credited. |
| **E11** | Partial Acceptance | Some units pass QC, others fail. | Accepted qty credited to inventory; rejected qty held in Quarantine zone. |
| **E12** | Return to Supplier | Rejected goods returned. | **Supplier Return Note (SRN)** generated; debit note issued to supplier. |
| **E13** | Invoice Mismatch | PO amount $\neq$ GRN qty $\neq$ Supplier Invoice. | System flags financial hold; Finance resolves variance with Procurement. |
| **E14** | Payment Delay | Invoice pending payment past due date. | Payment status flagged; supplier credit limit alert. |
| **E15** | Stock Adjustment | Physical audit balance differs from system balance. | Inventory Adjustment transaction logged with mandatory supervisor sign-off. |

---

## 6. 🛡️ Critical Business Rules & Governance

1. **Approval Hierarchy**:
   - PR must be approved before RFQ or PO creation.
   - PO must be approved before dispatching to supplier.
2. **GRN Traceability**:
   - A GRN cannot be created without referencing a valid, approved PO.
3. **Quality Quarantine Gate**:
   - Received goods cannot be moved to available inventory or issued to production until Quality Inspection is signed off.
4. **Supplier Returns (SRN)**:
   - Rejected goods must strictly generate a Supplier Return Note (SRN) for accounting and inventory balancing.
5. **Financial 3-Way Match**:
   - Payment Vouchers require automated verification between **PO (Price)**, **GRN (Received Qty)**, and **Supplier Invoice (Billed Amount)**.
6. **Stock Integrity**:
   - System strictly prevents negative inventory balances.
   - Every stock movement must produce a immutable transaction log entry (Stock In, Stock Out, Transfer, Adjustment).

---

## 7. 📊 Key Performance Indicators (KPIs)

- **Inventory Turnover Ratio**: Speed of stock conversion into production/sales.
- **On-Time Delivery Rate (%)**: Percentage of POs delivered by supplier on or before agreed date.
- **PO Cycle Time**: Duration from PR creation to PO release.
- **Order Fill Rate (%)**: Percentage of material requests fulfilled immediately from available stock.
- **Stock Accuracy (%)**: Match percentage between physical inventory count and system records.
- **Supplier OTIF (On-Time In-Full)**: Metric measuring supplier delivery punctuality and quantity completeness.
- **Total Procurement Spend**: Aggregate monetary spend per category, supplier, and department.
