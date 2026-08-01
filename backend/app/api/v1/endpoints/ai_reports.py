"""
Production AI Agent — AI Insights & Report Export Endpoints
============================================================
REST API endpoints for generating AI reports and downloading PDF briefs.
"""

from typing import Any, Dict, List

from fastapi import APIRouter, Depends, Response

from app.api.deps import CurrentUser, get_ai_service, get_export_service
from app.services.ai_service import AIService
from app.services.export_service import ExportService

router = APIRouter(prefix="/ai-reports", tags=["AI Insights & Reports"])


@router.post(
    "/generate",
    summary="Generate a new AI Executive Brief",
)
async def generate_ai_report(
    current_user: CurrentUser = None,
    ai_service: AIService = Depends(get_ai_service),
) -> Dict[str, Any]:
    return await ai_service.generate_executive_report(user_id=str(current_user.id))


@router.get(
    "/latest",
    summary="Get the latest AI Executive Brief",
)
async def get_latest_ai_report(
    current_user: CurrentUser = None,
    ai_service: AIService = Depends(get_ai_service),
) -> Dict[str, Any]:
    report = await ai_service.get_latest_report()
    return report or {}


@router.get(
    "/export/pdf",
    summary="Download Executive Brief as PDF document",
)
async def export_pdf_report(
    current_user: CurrentUser = None,
    ai_service: AIService = Depends(get_ai_service),
    export_service: ExportService = Depends(get_export_service),
):
    report = await ai_service.get_latest_report()
    if not report:
        report = await ai_service.generate_executive_report(user_id=str(current_user.id))

    pdf_bytes = export_service.generate_pdf_report(report)
    filename = f"Executive_Brief_{report.get('generated_at', '')[:10]}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
