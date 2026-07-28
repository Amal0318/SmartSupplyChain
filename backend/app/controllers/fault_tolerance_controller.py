from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.fault_tolerance import AgentHealthLog
from app.schemas.fault_tolerance import AgentHealthStatusResponse, AgentHealthOverviewResponse
from app.core.circuit_breaker import circuit_breakers
from app.controllers.auth_controller import get_current_user
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/fault-tolerance", tags=["AI Fault Tolerance & Resiliency Monitoring"])


@router.get("/agent-health/overview", response_model=AgentHealthOverviewResponse)
def get_agent_health_overview(db: Session = Depends(get_db)):
    logs = db.query(AgentHealthLog).order_by(AgentHealthLog.created_at.desc()).limit(20).all()

    healthy_count = 0
    degraded_count = 0
    down_count = 0

    for cb in circuit_breakers.values():
        if cb.state == "CLOSED":
            healthy_count += 1
        elif cb.state == "HALF_OPEN":
            degraded_count += 1
        else:
            down_count += 1

    overall_status = "HEALTHY"
    if down_count > 0:
        overall_status = "DOWN (CIRCUIT TRIPPED)"
    elif degraded_count > 0:
        overall_status = "DEGRADED (HALF-OPEN RECOVERY)"

    return AgentHealthOverviewResponse(
        total_agents=len(circuit_breakers),
        healthy_agents_count=healthy_count,
        degraded_agents_count=degraded_count,
        down_agents_count=down_count,
        overall_circuit_status=overall_status,
        health_logs=logs
    )


@router.get("/agent-health/logs", response_model=List[AgentHealthStatusResponse])
def list_health_logs(db: Session = Depends(get_db)):
    return db.query(AgentHealthLog).order_by(AgentHealthLog.created_at.desc()).limit(100).all()


@router.post("/agent-health/reset/{agent_name}")
def reset_agent_circuit_breaker(
    agent_name: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    if agent_name in circuit_breakers:
        cb = circuit_breakers[agent_name]
        cb.state = "CLOSED"
        cb.failure_count = 0
        return {"status": "SUCCESS", "message": f"Circuit breaker for {agent_name} reset to CLOSED."}
    return {"status": "ERROR", "message": "Agent not found."}
