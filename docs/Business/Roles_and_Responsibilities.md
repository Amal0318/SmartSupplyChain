# 🛡️ Roles & Responsibilities (RBAC Matrix)

| Role | Module Access | Key Permissions |
| :--- | :--- | :--- |
| **System Admin** | All Modules | Full system read/write, user management, configuration settings. |
| **Supply Chain Manager** | All Modules | Executive dashboards, cross-department analytics, read-all, override approvals. |
| **Procurement Manager** | Procurement, Suppliers | Approve PRs, approve POs, finalize vendor selection, view procurement analytics. |
| **Procurement Executive** | Procurement, Suppliers | Create RFQs, draft POs, update vendor details, log quotations. |
| **Warehouse Manager** | Inventory, Warehouse | Create PRs, approve stock transfers, manage warehouse bin configurations, audit stock. |
| **Warehouse Staff** | Inventory, Warehouse | Create GRNs, execute putaway, perform picking & packing, log material issues. |
| **Quality Inspector** | QC, Inventory | Log quality inspection results, approve/reject incoming goods, issue SRNs. |
| **Production Manager** | Production, Inventory | Create BOMs, issue Work Orders, submit material requests. |
| **Logistics Manager** | Logistics | Dispatch shipments, assign carriers, update ETA and delivery statuses. |
| **Finance Manager** | Finance, Procurement | Review 3-Way matches, authorize supplier payment vouchers, monitor budget limits. |
| **Supplier (External)** | Supplier Portal | View POs, submit quotations, update shipment tracking, submit invoices. |
