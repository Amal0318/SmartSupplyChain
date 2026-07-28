from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.repositories.analytics_repository import AnalyticsRepository
from app.schemas.analytics import (
    ExecutiveDashboardSummary, DemandForecastResponse, ExecutiveReportCreate, ExecutiveReportResponse
)
from app.controllers.auth_controller import get_current_user
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/analytics", tags=["Analytics & Executive Business Intelligence"])


@router.get("/executive/summary", response_model=ExecutiveDashboardSummary)
def get_executive_summary(db: Session = Depends(get_db)):
    repo = AnalyticsRepository(db)
    return repo.get_executive_summary()


@router.get("/forecasts", response_model=List[DemandForecastResponse])
def list_forecasts(db: Session = Depends(get_db)):
    repo = AnalyticsRepository(db)
    return repo.get_forecasts()


@router.get("/reports", response_model=List[ExecutiveReportResponse])
def list_reports(db: Session = Depends(get_db)):
    repo = AnalyticsRepository(db)
    return repo.get_reports()


@router.post("/reports", response_model=ExecutiveReportResponse, status_code=status.HTTP_201_CREATED)
def generate_report(
    report_in: ExecutiveReportCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = AnalyticsRepository(db)
    return repo.create_report(user_id=current_user.id, report_in=report_in)
