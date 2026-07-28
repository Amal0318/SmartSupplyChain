from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class AgentInsightResponse(BaseModel):
    id: str
    agent_name: str
    risk_level: str
    title: str
    reasoning: str
    recommendation: str
    confidence_score: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ManagerExecutiveSummaryResponse(BaseModel):
    id: str
    total_risks_detected: int
    critical_priorities: int
    overall_health_score: float
    executive_synthesis: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ControlTowerAnalysisResponse(BaseModel):
    manager_summary: ManagerExecutiveSummaryResponse
    agent_insights: List[AgentInsightResponse]
