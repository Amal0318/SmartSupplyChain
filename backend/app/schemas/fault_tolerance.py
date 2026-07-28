from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class AgentHealthStatusResponse(BaseModel):
    id: str
    agent_name: str
    status: str
    circuit_state: str
    heartbeat_timestamp: datetime
    latency_ms: int
    failure_count: int
    last_error: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AgentHealthOverviewResponse(BaseModel):
    total_agents: int
    healthy_agents_count: int
    degraded_agents_count: int
    down_agents_count: int
    overall_circuit_status: str
    health_logs: List[AgentHealthStatusResponse]
