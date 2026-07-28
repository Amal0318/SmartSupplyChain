import time
from datetime import datetime, timezone
from typing import Callable, Any, Dict
from sqlalchemy.orm import Session
from app.models.fault_tolerance import AgentHealthLog


class CircuitBreaker:
    """Enterprise Fault Tolerance Circuit Breaker State Machine."""

    def __init__(self, agent_name: str, failure_threshold: int = 3, cooldown_seconds: int = 30):
        self.agent_name = agent_name
        self.failure_threshold = failure_threshold
        self.cooldown_seconds = cooldown_seconds
        self.failure_count = 0
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
        self.last_failure_time = 0.0
        self.cached_snapshot: Dict[str, Any] = {}

    def execute_with_resiliency(self, db: Session, agent_func: Callable[[], Dict[str, Any]]) -> Dict[str, Any]:
        now = time.time()

        # Check if circuit is OPEN and cooldown has passed
        if self.state == "OPEN":
            if now - self.last_failure_time > self.cooldown_seconds:
                self.state = "HALF_OPEN"
            else:
                # Return cached fallback snapshot with degraded confidence score
                return self._get_cached_fallback(db, "Circuit OPEN: Serving cached fallback response.")

        start_ms = time.time()
        try:
            # Execute with retry logic (up to 2 retries)
            res = None
            for attempt in range(2):
                try:
                    res = agent_func()
                    break
                except Exception as e:
                    if attempt == 1:
                        raise e
                    time.sleep(0.05)

            # Success path
            latency = int((time.time() - start_ms) * 1000)
            self.failure_count = 0
            self.state = "CLOSED"
            self.cached_snapshot = res

            self._log_health(db, status="HEALTHY", state="CLOSED", latency=latency, error=None)
            return res

        except Exception as err:
            latency = int((time.time() - start_ms) * 1000)
            self.failure_count += 1
            self.last_failure_time = time.time()

            if self.failure_count >= self.failure_threshold:
                self.state = "OPEN"

            self._log_health(db, status="DEGRADED" if self.state == "HALF_OPEN" else "DOWN", state=self.state, latency=latency, error=str(err))

            # Return fallback with reduced confidence score penalty (60.0%)
            return self._get_cached_fallback(db, str(err))

    def _get_cached_fallback(self, db: Session, error_msg: str) -> Dict[str, Any]:
        if self.cached_snapshot:
            fallback = self.cached_snapshot.copy()
            fallback["confidence_score"] = 60.0  # Dynamic confidence penalty for cached data
            fallback["reasoning"] += f" (FALLBACK ACTIVE: {error_msg})"
            return fallback

        # Default rule-based fallback if no cache exists
        return {
            "agent_name": self.agent_name,
            "risk_level": "LOW",
            "title": f"{self.agent_name} Rule-Based Fallback Telemetry",
            "reasoning": f"Standard operational baseline active. Resiliency engine engaged ({error_msg}).",
            "recommendation": "Maintain standard operational rules while AI agent self-heals.",
            "confidence_score": 50.0,
        }

    def _log_health(self, db: Session, status: str, state: str, latency: int, error: Any):
        try:
            health_record = AgentHealthLog(
                agent_name=self.agent_name,
                status=status,
                circuit_state=state,
                heartbeat_timestamp=datetime.now(timezone.utc),
                latency_ms=latency,
                failure_count=self.failure_count,
                last_error=str(error) if error else None
            )
            db.add(health_record)
            db.commit()
        except:
            db.rollback()


# Global Registry of Agent Circuit Breakers
circuit_breakers: Dict[str, CircuitBreaker] = {
    "Procurement Agent": CircuitBreaker("Procurement Agent"),
    "Inventory Agent": CircuitBreaker("Inventory Agent"),
    "Warehouse Agent": CircuitBreaker("Warehouse Agent"),
    "Production Agent": CircuitBreaker("Production Agent"),
    "Logistics Agent": CircuitBreaker("Logistics Agent"),
    "Analytics Agent": CircuitBreaker("Analytics Agent"),
    "Manager Agent": CircuitBreaker("Manager Agent"),
}
