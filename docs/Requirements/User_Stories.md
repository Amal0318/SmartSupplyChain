# 👤 User Stories

## Module: Procurement & Procurement Agent
- **US-PROC-01**: *As an Inventory Controller*, I want to automatically generate a Purchase Requisition when stock falls below reorder points so that materials are replenished before stockouts occur.
- **US-PROC-02**: *As a Procurement Manager*, I want the Procurement AI Agent to score supplier risk and suggest alternative vendors so that order delays are minimized.

## Module: Inventory & Inventory Agent
- **US-INV-01**: *As a Warehouse Manager*, I want the Inventory AI Agent to detect overstocked items and recommend reorder quantities so that holding costs are minimized.
- **US-INV-02**: *As a Quality Inspector*, I want to record pass/fail inspection results so that defective stock is returned via SRN.

## Module: Production & Production Agent
- **US-PROD-01**: *As a Production Supervisor*, I want the Production AI Agent to predict work order bottlenecks based on raw material availability so that machine downtime is avoided.

## Module: Logistics & Logistics Agent
- **US-LOG-01**: *As a Logistics Manager*, I want the Logistics AI Agent to provide live shipment ETA predictions so that delivery disruptions can be proactively managed.

## Module: Manager Agent & Control Tower
- **US-MGR-01**: *As a Supply Chain Executive*, I want the Manager Agent to summarize overall supply chain health, rank risk levels, and present cross-departmental impact reports in a single Executive Control Tower dashboard.
- **US-MGR-02**: *As an Operations Director*, I want to view agent health statuses and confidence ratings on recommendations so that I know whether insights are based on live or cached data.
- **US-MGR-03**: *As a System Administrator*, I want automated agent retries and cached fallbacks so that system operations never halt if an AI sub-service is down.
