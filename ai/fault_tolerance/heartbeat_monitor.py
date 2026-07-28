import time
from typing import Dict, Any, List

class HeartbeatMonitor:
    """
    Monitors status, latency, and circuit breaker states for all 7 AI Agents.
    States: HEALTHY, DEGRADED, UNHEALTHY
    """
    def __init__(self):
        self.agent_statuses = {
            "Manager Agent": {"status": "HEALTHY", "latency_ms": 12, "last_heartbeat": time.time()},
            "Procurement Agent": {"status": "HEALTHY", "latency_ms": 24, "last_heartbeat": time.time()},
            "Inventory Agent": {"status": "HEALTHY", "latency_ms": 18, "last_heartbeat": time.time()},
            "Warehouse Agent": {"status": "HEALTHY", "latency_ms": 15, "last_heartbeat": time.time()},
            "Production Agent": {"status": "HEALTHY", "latency_ms": 30, "last_heartbeat": time.time()},
            "Logistics Agent": {"status": "HEALTHY", "latency_ms": 22, "last_heartbeat": time.time()},
            "Analytics Agent": {"status": "HEALTHY", "latency_ms": 14, "last_heartbeat": time.time()},
        }

    def record_heartbeat(self, agent_name: str, latency_ms: float, status: str = "HEALTHY"):
        self.agent_statuses[agent_name] = {
            "status": status,
            "latency_ms": round(latency_ms, 2),
            "last_heartbeat": time.time()
        }

    def get_all_health(self) -> Dict[str, Any]:
        unhealthy_count = sum(1 for v in self.agent_statuses.values() if v["status"] != "HEALTHY")
        overall_health = "HEALTHY" if unhealthy_count == 0 else ("DEGRADED" if unhealthy_count <= 2 else "CRITICAL")
        
        return {
            "overall_health": overall_health,
            "agents": self.agent_statuses,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
