from typing import Dict, Any, List

class ManagerAgent:
    """
    7. Manager Agent (Central Decision Engine & Orchestrator)
    Purpose: Orchestrates all 6 domain agents, performs cross-departmental dependency analysis,
             calculates overall executive confidence score (0-100%), and generates executive report summaries.
    Formula: Executive Confidence = Sum(w_i * Agent_i.confidence_score)
    """
    def __init__(self):
        # Weights for domain agents (Sum = 1.0)
        self.weights = {
            "Procurement Agent": 0.20,
            "Inventory Agent": 0.20,
            "Production Agent": 0.20,
            "Logistics Agent": 0.15,
            "Warehouse Agent": 0.15,
            "Analytics Agent": 0.10
        }

    def calculate_executive_confidence(self, agent_outputs: List[Dict[str, Any]]) -> float:
        total_score = 0.0
        total_weight = 0.0
        
        for out in agent_outputs:
            agent_name = out.get("agent_name")
            conf = float(out.get("confidence_score", 90.0))
            w = self.weights.get(agent_name, 0.15)
            
            # If an agent is returning cached fallback, reduce weight/confidence slightly
            if out.get("is_cached_fallback"):
                conf *= 0.85

            total_score += w * conf
            total_weight += w

        if total_weight > 0:
            return round(total_score / total_weight, 1)
        return 90.0

    def evaluate_cross_departmental_risk(self, agent_outputs: List[Dict[str, Any]]) -> Dict[str, Any]:
        high_risk_count = 0
        medium_risk_count = 0
        impact_chains = []

        risk_by_agent = {out.get("agent_name"): out.get("risk_level", "LOW") for out in agent_outputs}
        
        # Check cross-departmental ripple effects
        # 1. Supplier OTIF delay -> Material Shortage -> Factory Work Order Delay
        if risk_by_agent.get("Procurement Agent") in ["MEDIUM", "HIGH"] and risk_by_agent.get("Inventory Agent") in ["MEDIUM", "HIGH"]:
            impact_chains.append("CRITICAL: Supplier delivery delays are propagating to SKU stockouts, risking factory work order halts.")

        # 2. Production Material Shortage -> Outbound Shipment Delay
        if risk_by_agent.get("Production Agent") in ["MEDIUM", "HIGH"] and risk_by_agent.get("Logistics Agent") in ["MEDIUM", "HIGH"]:
            impact_chains.append("HIGH: Production line bottlenecks risk delaying customer shipment dispatch deadlines.")

        for out in agent_outputs:
            r = out.get("risk_level", "LOW")
            if r == "HIGH":
                high_risk_count += 1
            elif r == "MEDIUM":
                medium_risk_count += 1

        overall_system_risk = "LOW"
        if high_risk_count >= 2 or len(impact_chains) > 0:
            overall_system_risk = "CRITICAL" if len(impact_chains) > 0 else "HIGH"
        elif high_risk_count == 1 or medium_risk_count >= 2:
            overall_system_risk = "MEDIUM"

        confidence_score = self.calculate_executive_confidence(agent_outputs)

        return {
            "manager_agent": "Manager Agent (Central Brain)",
            "overall_system_risk": overall_system_risk,
            "executive_confidence_score": confidence_score,
            "cross_departmental_impact_chains": impact_chains,
            "agent_findings_summary": agent_outputs,
            "system_status": "OPERATIONAL" if overall_system_risk in ["LOW", "MEDIUM"] else "ACTION_REQUIRED"
        }
