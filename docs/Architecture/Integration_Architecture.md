# 🔗 Integration & Security Architecture

## Integration Interfaces
1. **Supplier Portal API**: REST endpoints for external vendors to confirm POs, submit quotations, and upload invoices.
2. **Logistics & Carrier Integration**: Webhook receivers for third-party shipping status updates (FedEx, DHL, Logistics Partners).
3. **Barcode / RFID Scanning**: WebSocket & REST endpoints accepting hand-held scanner data for warehouse putaway and picking.
4. **Notification Service**: SMTP / SMS gateways for automated alerts (Low Stock, PO Approval Required).

## Security Architecture
- **Authentication**: JWT (JSON Web Tokens) with RS256 asymmetric signing.
- **Authorization**: Granular Role-Based Access Control (RBAC) checked at controller middleware layer.
- **Transport Security**: TLS 1.3 enforced for HTTPS endpoints.
- **Data Protection**: Sensitive credentials encrypted at rest.
- **Audit Logging**: Immutable system event logging stored in PostgreSQL audit log table.
