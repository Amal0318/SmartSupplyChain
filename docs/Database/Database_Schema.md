# 🗄️ Database Schema & Data Dictionary

```sql
-- PostgreSQL Enterprise Database Schema Definition

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users & Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'PROCUREMENT_MANAGER', 'PROCUREMENT_EXEC', 'WAREHOUSE_MANAGER', 'WAREHOUSE_STAFF', 'QUALITY_INSPECTOR', 'PRODUCTION_MANAGER', 'LOGISTICS_MANAGER', 'FINANCE_MANAGER', 'SUPPLIER')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    rating NUMERIC(3, 2) DEFAULT 5.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product Master Catalog
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit_of_measure VARCHAR(50) NOT NULL,
    unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    reorder_level INT NOT NULL DEFAULT 10,
    safety_stock INT NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Requisitions
CREATE TABLE purchase_requisitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pr_number VARCHAR(100) UNIQUE NOT NULL,
    requested_by UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CLOSED')),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Orders
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(100) UNIQUE NOT NULL,
    pr_id UUID REFERENCES purchase_requisitions(id),
    supplier_id UUID REFERENCES suppliers(id),
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'SENT', 'PARTIAL', 'RECEIVED', 'CANCELLED')),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Goods Receipt Notes (GRN)
CREATE TABLE goods_receipt_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_number VARCHAR(100) UNIQUE NOT NULL,
    po_id UUID REFERENCES purchase_orders(id),
    received_by UUID REFERENCES users(id),
    received_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quality Inspections
CREATE TABLE quality_inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_id UUID REFERENCES goods_receipt_notes(id),
    inspector_id UUID REFERENCES users(id),
    accepted_qty INT NOT NULL DEFAULT 0,
    rejected_qty INT NOT NULL DEFAULT 0,
    status VARCHAR(50) CHECK (status IN ('PASSED', 'REJECTED', 'PARTIAL')),
    notes TEXT,
    inspected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stock Transactions Audit Log
CREATE TABLE stock_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    transaction_type VARCHAR(50) CHECK (transaction_type IN ('STOCK_IN', 'STOCK_OUT', 'TRANSFER', 'ADJUSTMENT', 'RETURN')),
    quantity INT NOT NULL,
    reference_id UUID,
    performed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- MULTI-AGENT CONTROL TOWER & FAULT-TOLERANCE TABLES
-- =================================================================

-- AI Agent Health & Heartbeat Logs
CREATE TABLE agent_health_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_name VARCHAR(100) NOT NULL CHECK (agent_name IN ('PROCUREMENT_AGENT', 'INVENTORY_AGENT', 'PRODUCTION_AGENT', 'LOGISTICS_AGENT', 'MANAGER_AGENT')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('HEALTHY', 'DEGRADED', 'UNREACHABLE', 'FALLBACK_ACTIVE')),
    latency_ms INT,
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT
);

-- Domain Agent Insights & Recommendations
CREATE TABLE agent_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_name VARCHAR(100) NOT NULL,
    domain VARCHAR(50) NOT NULL CHECK (domain IN ('PROCUREMENT', 'INVENTORY', 'PRODUCTION', 'LOGISTICS')),
    insight_type VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    details JSONB,
    confidence_score NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    is_cached_fallback BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Executive Control Tower Risk Reports
CREATE TABLE executive_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_title VARCHAR(255) NOT NULL,
    overall_risk_level VARCHAR(50) NOT NULL CHECK (overall_risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    health_score NUMERIC(5, 2) NOT NULL,
    executive_summary TEXT NOT NULL,
    recommendations JSONB NOT NULL,
    aggregated_confidence NUMERIC(5, 2) NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
