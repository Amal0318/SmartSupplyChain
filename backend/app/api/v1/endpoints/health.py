"""
Production AI Agent — Health Check Endpoint
============================================
System health and readiness check endpoint.
"""

import time
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.config import get_settings
from app.db.mongodb import mongo_manager
from app.schemas.schemas import HealthCheckResponse, ServiceHealth

router = APIRouter(tags=["Health"])
settings = get_settings()


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    summary="System health check",
)
async def health_check() -> HealthCheckResponse:
    services = []
    overall_healthy = True

    # 1. MongoDB Health
    mongo_health = ServiceHealth(name="mongodb", status="unhealthy")
    try:
        t0 = time.perf_counter()
        if mongo_manager.client:
            await mongo_manager.client.admin.command("ping")
            latency = (time.perf_counter() - t0) * 1000
            mongo_health.status = "healthy"
            mongo_health.latency_ms = round(latency, 2)
        else:
            mongo_health.detail = "Database client not initialized"
            overall_healthy = False
    except Exception as e:
        mongo_health.detail = str(e)
        overall_healthy = False
    services.append(mongo_health)

    # 2. LLM Provider Status
    llm_health = ServiceHealth(
        name=f"llm_{settings.llm_provider}",
        status="healthy" if settings.llm_provider in ["mock", "openai"] else "degraded",
        detail=f"Provider: {settings.llm_provider}",
    )
    services.append(llm_health)

    return HealthCheckResponse(
        status="healthy" if overall_healthy else "degraded",
        version=settings.app_version,
        environment=settings.app_env,
        timestamp=datetime.now(timezone.utc),
        services=services,
    )
