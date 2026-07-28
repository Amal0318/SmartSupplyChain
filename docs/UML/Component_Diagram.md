# 📐 Component & Deployment Diagrams

## Component Diagram
```mermaid
graph TD
    subgraph Frontend Client
        UI[React + TS Control Tower Web App]
    end

    subgraph Backend Core (FastAPI)
        AuthComp[Auth & RBAC Middleware]
        ProcComp[Procurement Service]
        InvComp[Inventory & Warehouse Service]
        ProdComp[Production Service]
        LogComp[Logistics Service]
    end

    subgraph Fault-Tolerant Multi-Agent Layer
        MgrAgent[Manager Agent Orchestrator]
        PAgent[Procurement Agent]
        IAgent[Inventory Agent]
        PrAgent[Production Agent]
        LAgent[Logistics Agent]
    end

    subgraph Persistence & Cache
        DB[(PostgreSQL DB)]
        Cache[(Redis Cache & Heartbeats)]
    end

    UI --> AuthComp
    AuthComp --> ProcComp
    AuthComp --> InvComp
    AuthComp --> ProdComp
    AuthComp --> LogComp
    AuthComp --> MgrAgent

    ProcComp --> PAgent
    InvComp --> IAgent
    ProdComp --> PrAgent
    LogComp --> LAgent

    PAgent --> MgrAgent
    IAgent --> MgrAgent
    PrAgent --> MgrAgent
    LAgent --> MgrAgent

    MgrAgent --> Cache
    MgrAgent --> DB
    ProcComp --> DB
    InvComp --> DB
```
