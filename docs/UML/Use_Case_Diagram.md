# 📐 Use Case Diagram & Specifications

```mermaid
graph LR
    subgraph Users & Roles
        IC[Inventory Controller]
        PM[Procurement Manager]
        PE[Procurement Executive]
        WS[Warehouse Staff]
        QI[Quality Inspector]
        SUP[Supplier]
    end

    subgraph Smart Supply Chain Platform
        UC1((Monitor Stock Levels))
        UC2((Create Purchase Requisition))
        UC3((Approve / Reject PR))
        UC4((Create & Issue RFQ))
        UC5((Submit Quotation))
        UC6((Generate & Approve PO))
        UC7((Confirm PO & Dispatch))
        UC8((Create Goods Receipt GRN))
        UC9((Quality Inspection Pass/Fail))
        UC10((Stock Putaway & Inventory Update))
    end

    IC --> UC1
    IC --> UC2
    PM --> UC3
    PE --> UC4
    SUP --> UC5
    PM --> UC6
    SUP --> UC7
    WS --> UC8
    QI --> UC9
    WS --> UC10
```

## Primary Use Cases
1. **UC-01: Requisition Creation**: Triggered automatically on low stock or manually by Inventory Controller.
2. **UC-02: PO Issuance**: Procurement Executive selects winning vendor bid, Manager approves PO, System issues PO to Supplier.
3. **UC-03: Quality Receiving**: Warehouse logs GRN, Quality Inspector records test results, System updates stock balance or generates SRN.
