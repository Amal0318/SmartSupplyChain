import time
from typing import Dict, Any, Optional

class CacheFallbackManager:
    """
    Stores cached analysis snapshots for AI Agents to provide graceful fallback when an agent times out or fails.
    """
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}

    def set_cached_insight(self, agent_name: str, payload: Dict[str, Any]):
        payload_copy = dict(payload)
        payload_copy["cached_at"] = time.time()
        payload_copy["is_cached_fallback"] = False
        self._cache[agent_name] = payload_copy

    def get_fallback_insight(self, agent_name: str) -> Dict[str, Any]:
        if agent_name in self._cache:
            cached = dict(self._cache[agent_name])
            cached["is_cached_fallback"] = True
            cached["reasoning"] = f"[CACHED FALLBACK] {cached.get('reasoning', '')}"
            cached["confidence_score"] = round(float(cached.get("confidence_score", 90.0)) * 0.85, 1)
            return cached
        
        return {
            "agent_name": agent_name,
            "risk_level": "UNKNOWN",
            "title": f"{agent_name} Fallback Snapshot",
            "reasoning": f"Agent {agent_name} unavailable; using basic default safety threshold.",
            "recommendations": ["Investigate agent telemetry pipeline connection."],
            "confidence_score": 50.0,
            "is_cached_fallback": True
        }
