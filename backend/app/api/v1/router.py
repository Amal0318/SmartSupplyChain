"""
Production AI Agent — API v1 Router
====================================
Combines all v1 endpoint routers under /api/v1.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import ai_reports, analytics, auth, health, uploads, users

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(uploads.router)
api_router.include_router(analytics.router)
api_router.include_router(ai_reports.router)
