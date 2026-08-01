"""
Production AI Agent — Main FastAPI Application Entrypoint
==========================================================
Configures:
  - Lifespan events (MongoDB connect/disconnect, admin seeding)
  - CORS middleware
  - Global exception handlers
  - API v1 routers
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging, get_logger
from app.db.mongodb import mongo_manager
from app.db.repositories.audit_repository import AuditRepository
from app.db.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application Lifespan Context Manager.
    Handles startup and shutdown tasks.
    """
    # 1. Configure structured logging
    configure_logging()
    logger = get_logger("app.main")
    logger.info(
        "Starting Production AI Agent API",
        version=settings.app_version,
        env=settings.app_env,
    )

    # 2. Connect to MongoDB
    await mongo_manager.connect()

    # 3. Seed Default Admin User
    db = mongo_manager.db
    if db is not None:
        user_repo = UserRepository(db)
        audit_repo = AuditRepository(db)
        auth_service = AuthService(user_repo=user_repo, audit_repo=audit_repo)
        await auth_service.seed_admin_user()

    yield  # Application runs while yielded

    # 4. Cleanup on Shutdown
    logger.info("Shutting down Production AI Agent API")
    await mongo_manager.disconnect()


def create_application() -> FastAPI:
    """FastAPI Application Factory."""
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Smart Supply Chain Monitoring & Analytics System — Production AI Agent Module",
        openapi_url=f"{settings.api_v1_prefix}/openapi.json",
        docs_url=f"{settings.api_v1_prefix}/docs",
        redoc_url=f"{settings.api_v1_prefix}/redoc",
        lifespan=lifespan,
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Exception Handlers
    register_exception_handlers(app)

    # Include Routers
    app.include_router(api_router, prefix=settings.api_v1_prefix)

    return app


app = create_application()
