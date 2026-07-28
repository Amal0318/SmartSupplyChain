from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.ai_agent_service import ManagerAgent
from app.schemas.ai_agents import ControlTowerAnalysisResponse, ManagerExecutiveSummaryResponse, AgentInsightResponse
from app.models.ai_agents import ManagerExecutiveSummary, AgentInsight
from app.controllers.auth_controller import get_current_user
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/control-tower", tags=["Multi-Agent AI Control Tower"])


@router.post("/analyze", response_model=ControlTowerAnalysisResponse)
def run_control_tower_analysis(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    manager = ManagerAgent()
    return manager.execute_control_tower_synthesis(db)


@router.get("/summary", response_model=ControlTowerAnalysisResponse)
def get_control_tower_summary(db: Session = Depends(get_db)):
    summary = db.query(ManagerExecutiveSummary).order_by(ManagerExecutiveSummary.created_at.desc()).first()
    insights = db.query(AgentInsight).order_by(AgentInsight.created_at.desc()).limit(7).all()

    if not summary:
        manager = ManagerAgent()
        return manager.execute_control_tower_synthesis(db)

    return {
        "manager_summary": summary,
        "agent_insights": insights,
    }
