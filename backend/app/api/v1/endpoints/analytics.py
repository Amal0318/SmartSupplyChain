"""
Production AI Agent — Supply Chain & Production Analytics Endpoints
=====================================================================
REST API endpoints serving warehouse and production metrics to the UI dashboard.
"""

from typing import Any, Dict

from fastapi import APIRouter, Depends

from app.api.deps import CurrentUser, get_analytics_service
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get(
    "/warehouse",
    summary="Get Warehouse & Inventory Analytics metrics",
)
async def get_warehouse_analytics(
    current_user: CurrentUser = None,
    analytics_service: AnalyticsService = Depends(get_analytics_service),
) -> Dict[str, Any]:
    return await analytics_service.get_warehouse_analytics()


@router.get(
    "/production",
    summary="Get Production Schedule & Machine Analytics metrics",
)
async def get_production_analytics(
    current_user: CurrentUser = None,
    analytics_service: AnalyticsService = Depends(get_analytics_service),
) -> Dict[str, Any]:
    return await analytics_service.get_production_analytics()
