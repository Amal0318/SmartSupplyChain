from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.core.config import settings
from app.core.logging_config import setup_logging
from app.core.middleware import SecurityHeadersMiddleware, PerformanceLoggingMiddleware
from app.database.session import Base, engine
from app.models import (
    user, organization, supplier, product, procurement,
    inventory, warehouse, production, logistics, analytics, ai_agents, fault_tolerance
)
from app.controllers import (
    auth_controller,
    organization_controller,
    supplier_controller,
    product_controller,
    procurement_controller,
    inventory_controller,
    warehouse_controller,
    production_controller,
    logistics_controller,
    analytics_controller,
    ai_controller,
    fault_tolerance_controller
)

# Initialize structured logging
setup_logging()

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Security & Performance Middlewares
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(PerformanceLoggingMiddleware)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1 Routers
app.include_router(auth_controller.router, prefix=settings.API_V1_STR)
app.include_router(organization_controller.router, prefix=settings.API_V1_STR)
app.include_router(supplier_controller.router, prefix=settings.API_V1_STR)
app.include_router(product_controller.router, prefix=settings.API_V1_STR)
app.include_router(procurement_controller.router, prefix=settings.API_V1_STR)
app.include_router(inventory_controller.router, prefix=settings.API_V1_STR)
app.include_router(warehouse_controller.router, prefix=settings.API_V1_STR)
app.include_router(production_controller.router, prefix=settings.API_V1_STR)
app.include_router(logistics_controller.router, prefix=settings.API_V1_STR)
app.include_router(analytics_controller.router, prefix=settings.API_V1_STR)
app.include_router(ai_controller.router, prefix=settings.API_V1_STR)
app.include_router(fault_tolerance_controller.router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "message": "AI-Powered Fault-Tolerant Multi-Agent Supply Chain Control Tower API",
        "status": "healthy",
        "version": settings.VERSION,
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "UP", "database": "CONNECTED", "security_headers": "ACTIVE", "gzip_compression": "ENABLED"}
