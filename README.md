# Production AI Agent

> **Smart Supply Chain Monitoring & Analytics System**  
> Focus Modules: **Warehouse Analytics** · **Production Analytics**

The **Production AI Agent** is an enterprise-grade AI solution designed to help Production Managers and Higher-Level Managers make data-driven decisions by automatically processing Procurement and Inventory CSV data, detecting operational risks, predicting shortages, and generating executive briefs.

---

## 🌟 Key Features

- **Enterprise Clean Architecture**: Layered FastAPI backend (Repository pattern, Dependency Injection, Pydantic v2).
- **JWT & Role-Based Access Control (RBAC)**: Secure authentication with `admin`, `manager`, and `viewer` roles.
- **CSV Ingestion Engine**: Multipart CSV file uploads with schema validation, path traversal prevention, and audit tracking.
- **MongoDB Async Integration**: Motor async driver with automated index creation and audit TTL expiration.
- **Modern React + TypeScript UI**: Built with TailwindCSS v3, glassmorphism dark mode aesthetic, Zustand state management, and Axios interceptors.
- **Independent AI Agent Pipeline**: Modular AI agent design ready for GPT integration or Mock offline mode.

---

## 🚀 Quick Start (Docker Compose)

The easiest way to run the full application (MongoDB + FastAPI Backend) is using Docker Compose.

```bash
# Clone and enter project directory
cd "d:/production ai agent"

# Start MongoDB and FastAPI Backend
docker-compose up --build
```

- **Backend API**: `http://localhost:8000/api/v1`
- **Interactive Swagger Docs**: `http://localhost:8000/api/v1/docs`

---

## 💻 Local Development Setup

### 1. Backend Setup (FastAPI + Python 3.11)

```bash
cd backend

# Create virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Run FastAPI Dev Server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup (React 18 + Vite + TailwindCSS)

```bash
cd frontend

# Install dependencies
npm install

# Start Vite Dev Server
npm run dev
```

- **Frontend Application**: `http://localhost:5173`

---

## 🔐 Default Test Credentials

Upon first startup, the system automatically seeds an initial Administrator account if no users exist:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@productionai.com` | `Admin@123!` |

---

## 📁 Sample CSV Files

Sample data files are provided in `sample_data/` for immediate testing:

- `sample_data/procurement_sample.csv`
- `sample_data/inventory_sample.csv`
- `sample_data/production_orders_sample.csv`

---

## 🧪 Running Unit Tests

```bash
cd backend
pytest tests/ -v
```

---

## 🏛️ Project Structure

```
production-ai-agent/
├── backend/
│   ├── app/
│   │   ├── api/          # REST Endpoints & Dependencies
│   │   ├── core/         # Config, Security, Logging, Exceptions
│   │   ├── db/           # MongoDB Connection & Repositories
│   │   ├── models/       # Pydantic Domain Models
│   │   ├── schemas/      # API Request/Response Schemas
│   │   ├── services/     # Auth & Upload Business Services
│   │   └── main.py       # FastAPI Entrypoint
│   ├── tests/            # Pytest Unit & Integration Tests
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios API Clients
│   │   ├── components/   # Shared & Feature UI Components
│   │   ├── pages/        # Dashboard, Upload, Login Pages
│   │   ├── store/        # Zustand Auth State
│   │   └── types/        # TypeScript Definitions
│   └── Dockerfile
├── sample_data/          # Sample CSV Data Files
├── docker-compose.yml
└── README.md
```
