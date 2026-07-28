import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Numeric, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base


def generate_uuid():
    return str(uuid.uuid4())


class ExecutiveReport(Base):
    __tablename__ = "executive_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    report_type = Column(String(50), nullable=False)  # PROCUREMENT, INVENTORY, PRODUCTION, LOGISTICS, CROSS_MODULE
    parameters = Column(Text, nullable=True)
    generated_by_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class DemandForecastPlaceholder(Base):
    __tablename__ = "demand_forecast_placeholders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    forecast_period = Column(String(50), nullable=False)  # e.g., 2026-Q3, 2026-Q4
    predicted_demand_qty = Column(Integer, nullable=False)
    confidence_score = Column(Numeric(5, 2), default=92.5)  # Percentage
    algorithm_type = Column(String(100), default="PROPHET_ARIMA_HYBRID")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    product = relationship("Product")
