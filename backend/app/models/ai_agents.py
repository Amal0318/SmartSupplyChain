import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Numeric, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base


def generate_uuid():
    return str(uuid.uuid4())


class AgentInsight(Base):
    __tablename__ = "agent_insights"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    agent_name = Column(String(100), nullable=False, index=True)  # Procurement, Inventory, Warehouse, Production, Logistics, Analytics, Manager
    risk_level = Column(String(50), default="LOW")  # LOW, MEDIUM, HIGH, CRITICAL
    title = Column(String(255), nullable=False)
    reasoning = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)
    confidence_score = Column(Numeric(5, 2), default=95.00)  # 0.00 to 100.00%
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ManagerExecutiveSummary(Base):
    __tablename__ = "manager_executive_summaries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    total_risks_detected = Column(Integer, default=0)
    critical_priorities = Column(Integer, default=0)
    overall_health_score = Column(Numeric(5, 2), default=98.00)
    executive_synthesis = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
