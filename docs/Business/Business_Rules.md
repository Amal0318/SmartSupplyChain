# 📜 Core Business Rules & Guardrails

## 1. Procurement Governance Rules
- **PR Threshold**: Purchase Requisitions above $10,000 require dual approval from Procurement Manager and Finance Manager.
- **RFQ Requirement**: Any purchase order exceeding $5,000 mandates a minimum of 3 supplier quotations (RFQs).
- **PO Immutability**: Once a Purchase Order is sent to a supplier, direct edits are locked. Changes require an official PO Amendment (revision history logged).

## 2. Inventory & Warehouse Rules
- **Non-Negative Stock Guardrail**: The system strictly rejects any transaction that would result in negative available inventory balances.
- **Quality Inspection Gate**: Goods received under GRN are placed in Quarantine status and cannot be committed to available stock until Quality Inspection approval.
- **Supplier Return Note (SRN)**: Rejected materials must have an associated SRN generated before debit notes or stock returns are processed.

## 3. Production Rules
- **Material Availability Check**: Work Orders cannot be set to *In Progress* unless 100% of required BOM raw materials are reserved in available stock.

## 4. Finance & 3-Way Matching Rules
- **Automated 3-Way Match**: Supplier payments require strict automated validation matching:
  $$\text{PO Unit Price} == \text{Invoice Unit Price} \quad \land \quad \text{GRN Accepted Qty} == \text{Invoice Billed Qty}$$
- Variance exceeding $\pm 1\%$ flags an automated payment hold.

## 5. Audit & Compliance
- **Immutable Transaction Log**: All stock adjustments, approvals, status changes, and user actions must generate an immutable audit log entry.
