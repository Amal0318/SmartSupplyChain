# 🗄️ Data Architecture Specification

## Data Domain Model & Storage Strategy
The platform uses **PostgreSQL** as its core relational data store with ACID compliance for operational transactions, alongside **Redis** for in-memory snapshot recommendation caching and agent heartbeat health tracking.

```
                              ┌──────────────────┐
                              │  Users & Roles   │
                              └────────┬─────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            │                          │                          │
            ▼                          ▼                          ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│   Suppliers Master   │    │    Product Catalog   │    │  Warehouses & Bins   │
└───────────┬──────────┘    └──────────┬───────────┘    └──────────┬───────────┘
            │                          │                           │
            ▼                          ▼                           │
┌──────────────────────┐    ┌──────────────────────┐               │
│ Purchase Requisitions│    │ Inventory Quantities │ ◄─────────────┘
└───────────┬──────────┘    └──────────┬───────────┘
            │                          │
            ▼                          │
┌──────────────────────┐               │
│   Purchase Orders    │               │
└───────────┬──────────┘               │
            │                          │
            ▼                          ▼
┌──────────────────────┐    ┌──────────────────────┐
│ Goods Receipt (GRN)  │ ──►│ Stock Transactions   │
└──────────────────────┘    └──────────┬───────────┘
                                       │
                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│               MULTI-AGENT DATA & FAULT-TOLERANCE LAYER                 │
│  ┌────────────────────┐   ┌────────────────────┐   ┌────────────────┐  │
│  │ Agent Health Logs  │   │   Agent Insights   │   │Exec Risk Reports│ │
│  └────────────────────┘   └────────────────────┘   └────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

## Data Management Standards
- **Naming Conventions**: `snake_case` for table and column names; plural nouns for tables (`purchase_orders`, `agent_health_logs`).
- **Primary Keys**: UUID v4 for unique identification across distributed systems.
- **Multi-Agent Caching**: Redis keys with TTL for cached prediction fallbacks (`agent:cache:<agent_name>`).
- **Audit Trails**: Mandatory `created_at`, `updated_at`, `created_by`, and `updated_by` metadata fields on all tables.
- **Soft Deletes**: Critical master records utilize `is_active` boolean or `deleted_at` timestamps instead of hard row deletions.
