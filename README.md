# Smart Supply Chain Control Tower — Production AI Agent

An enterprise-grade, high-performance monitoring and predictive analytics system designed for supply chain managers, warehouse directors, and executive leadership. This repository implements the core **Production AI Agent** module, focusing on **Warehouse & Production Analytics**, dynamic risk detection, and automated executive reporting.

---

## 🌟 Key Capabilities

### 🛡️ Clean Enterprise Architecture
- **FastAPI (Python 3.11/3.14)**: Asynchronous REST backend leveraging Dependency Injection, the Repository Pattern, and Pydantic v2 schemas.
- **Vite + React (TypeScript)**: Highly modular, dark-themed control tower interface using glassmorphism aesthetics, Zustand state management, and Axios interceptors.

### 📊 Ingestion & Validation Engine
- **Robust CSV Parser**: Secure multipart CSV file upload for *Procurement*, *Inventory*, and *Production Orders* data.
- **Data Sanitization**: Built-in path-traversal mitigation, MIME-type checks, file size constraints, and full audit logs.

### 🧠 Autonomous AI Agent Pipeline
- **Cascading Risk Detection**: Evaluates domain lead times, identifies warehouse capacity bottlenecks, and traces risk propagation from raw procurement to final logistics.
- **Mitigation Recommendations**: Generates contextual, actionable recommendations for supply chain disruptions.
- **Mock Service Mode**: Ready out-of-the-box with fully featured mock analysis engines for offline and development environments.

---

## 🏛️ Project Architecture

```
SmartSupplyChain/
├── backend/                       # Async REST Backend (FastAPI)
│   ├── app/
│   │   ├── api/                   # API Routers, Endpoints & Deps
│   │   ├── core/                  # Configuration, Logging, Exceptions
│   │   ├── db/                    # MongoDB Drivers & Repositories
│   │   ├── models/                # Pydantic Domain Models
│   │   ├── schemas/               # API Request/Response Schemas
│   │   ├── services/              # Business Logic & Auth Services
│   │   └── main.py                # FastAPI Entrypoint
│   ├── tests/                     # Pytest Unit & Integration Suite
│   ├── Dockerfile                 # Production Deployment Configuration
│   └── requirements.txt           # Python Dependencies
├── frontend/                      # Modern Dashboard UI (Vite + React + TS)
│   ├── src/
│   │   ├── api/                   # Axios API Clients
│   │   ├── store/                 # Zustand Auth State
│   │   ├── types/                 # Shared TypeScript Definitions
│   │   └── smart_ui/              # Modular UI Component System
│   │       ├── components/        # Analytics, Dashboards & Upload Components
│   │       ├── data/              # Simulated Domain Datasets
│   │       ├── utils/             # Normalizers & PDF export handlers
│   │       └── MainDashboard.tsx  # Parent SPA Dashboard Engine
│   └── Dockerfile                 # Frontend Build & Nginx Runner
├── database/                      # Persistent Database Mounts & Metadata
├── diagrams/                      # System Architecture & Workflow Visuals
├── docs/                          # API & Business Requirement Documents
├── sample_data/                   # Standard Seed CSV Templates
├── scripts/                       # Database Setup & Seeding Scripts
└── docker-compose.yml             # Orchestration for MongoDB & Backend Services
```

---

## 🚀 Quick Start (Docker Compose)

Launch the complete application stack (MongoDB and backend services) with a single command:

```bash
# Start the production stack
docker-compose up --build
```

- **API Base URL**: `http://localhost:8000/api/v1`
- **Swagger Documentation**: `http://localhost:8000/api/v1/docs`

---

## 💻 Local Development Setup

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run FastAPI Development Server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite Development Server
npm run dev
```

- **Frontend Interface**: `http://localhost:5173`

---

## 🔐 Default Administrator Credentials

On first startup, the database is seeded automatically with a default administrative account:

| Attribute | Value |
|---|---|
| **Role** | System Administrator |
| **Username / Email** | `admin@productionai.com` |
| **Password** | `Admin@123!` |

---

## 📁 Sample Datasets

Located under `sample_data/`, these CSV files can be imported directly into the dashboard upload module:

- `procurement_sample.csv`: Sample supplier lead times, categories, and unit costs.
- `inventory_sample.csv`: Sample SKU lists, locations, stock levels, and reorder alerts.
- `production_orders_sample.csv`: Factory assembly outputs, run targets, and downtime tracking.

---

## 🧪 Running Unit Tests

Verify backend logic and endpoint integrations by running the unit test suite:

```bash
cd backend
.venv\Scripts\python -m pytest
```
