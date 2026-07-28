# 💻 Application Architecture Specification

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND PRESENTATION LAYER                     │
│                React 18 + TypeScript + Tailwind CSS                    │
│    (Executive Control Tower, Procurement, Inventory, Production &      │
│                         Logistics Dashboards)                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP REST API / WebSockets
┌───────────────────────────────────▼────────────────────────────────────┐
│                           API GATEWAY / REVERSE PROXY                  │
│                                  Nginx                                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                        BACKEND APPLICATION SERVICES                    │
│                         FastAPI (Python Service Core)                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌───────────┐ ┌───────┐  │
│  │ Auth & RBAC│ │Procurement │ │ Inventory  │ │Production │ │ Core  │  │
│  │   Router   │ │   Router   │ │ & Warehouse│ │ & Logistics││ APIs  │  │
│  └────────────┘ └────────────┘ └────────────┘ └───────────┘ └───────┘  │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│               FAULT-TOLERANT MULTI-AGENT INTELLIGENCE LAYER            │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                          MANAGER AGENT                           │  │
│  │      (Cross-Risk Analysis • Health Monitor • Fallback Handler)   │  │
│  └───────▲──────────────────▲──────────────────▲─────────────────▲──┘  │
│          │                  │                  │                 │     │
│  ┌───────┴────────┐ ┌───────┴────────┐ ┌───────┴────────┐ ┌──────┴────┐│
│  │  Procurement   │ │   Inventory    │ │   Production   │ │ Logistics ││
│  │     Agent      │ │     Agent      │ │     Agent      │ │   Agent   ││
│  └────────────────┘ └────────────────┘ └────────────────┘ └───────────┘│
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
┌──────────────────▼──────────────────┐   ┌──────────▼───────────────────┐
│           DATA STORAGE              │   │         IN-MEMORY CACHE      │
│            PostgreSQL               │   │              Redis           │
│  (Operational Data + Agent Audit    │   │  (Snapshot Recommendation    │
│   Logs + Executive Reports)         │   │   Cache + Agent Heartbeats)  │
└─────────────────────────────────────┘   └──────────────────────────────┘
```

## Architectural Principles
- **Clean Architecture & Separation of Concerns**: Operational REST endpoints, Multi-Agent Workers, and Data Access layers strictly separated.
- **Fault-Tolerant Resilience Engine**: Manager Agent intercepts agent timeouts, initiates automatic retries, reads cached prediction snapshots from Redis, adjusts confidence ratings, and logs diagnostic alerts without interrupting backend web APIs.
