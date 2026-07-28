# 🔄 Business Process Flows

## Smart Supply Chain System

---

## 1. High-Level Enterprise Supply Chain Flow

```
[ Customer Order / Forecast ] ──► [ Production Planning ] ──► [ Material Requirements Planning (MRP) ]
                                                                             │
                                                                             ▼
[ Production Execution ] ◄─── [ Stock Available ] ◄─── [ Check Inventory Balance ]
         │                                                           │ (If Stock Low)
         ▼                                                           ▼
[ Finished Goods Warehouse ]                                 [ Purchase Requisition (PR) ]
         │                                                           │
         ▼                                                           ▼
[ Logistics & Shipping ] ──► [ Customer Delivery ]          [ Procurement & Supplier PO ]
                                                                     │
                                                                     ▼
                                                             [ Goods Receipt & QC ]
                                                                     │
                                                                     ▼
                                                             [ Stock In Warehouse ]
```

## 2. Departmental Sub-Flows
1. **Procurement Flow**: PR $\rightarrow$ Approval $\rightarrow$ RFQ $\rightarrow$ Supplier Quotations $\rightarrow$ PO $\rightarrow$ Dispatch to Supplier.
2. **Receiving & Inspection Flow**: Goods Dock Arrival $\rightarrow$ GRN Creation $\rightarrow$ Quality Inspection Pass/Fail $\rightarrow$ Putaway to Warehouse Racks.
3. **Production Flow**: BOM Definition $\rightarrow$ Work Order Creation $\rightarrow$ Material Request to Warehouse $\rightarrow$ Assembly $\rightarrow$ Finished Goods Transfer.
4. **Logistics Flow**: Dispatch Order $\rightarrow$ Carrier Assignment $\rightarrow$ Waybill/Bill of Lading $\rightarrow$ Live Tracking $\rightarrow$ Proof of Delivery (POD).
