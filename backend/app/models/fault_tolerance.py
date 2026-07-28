import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Numeric, Integer
from app.database.session import Base


def generate_uuid():
    return str(uuid.uuid4())


class AgentHealthLog(Base):
    __tablename__ = "agent_health_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    agent_name = Column(String(100), nullable=False, index=True)
    status = Column(String(50), default="HEALTHY")  # HEALTHY, DEGRADED, DOWN
    circuit_state = Column(String(50), default="CLOSED")  # CLOSED, OPEN, HALF_OPEN
    heartbeat_timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    latency_ms = Column(Integer, default=15)
    failure_count = Column(Integer, default=0)
    last_error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
