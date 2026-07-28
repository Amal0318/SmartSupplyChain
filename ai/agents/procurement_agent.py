import math
from typing import Dict, Any, List

class ProcurementAgent:
    """
    1. Procurement Agent
    Purpose: Sourcing risk analysis, vendor evaluation, and PO recommendations.
    Decision Logic: Risk Score = 0.4 * (100 - OTIF) + 0.4 * Defect Rate % + 0.2 * Lead Time Variance
    """
    def __init__(self, otif_threshold: float = 85.0):
        self.otif_threshold = otif_threshold

    def calculate_vendor_risk(self, otif_rate: float, defect_rate: float, lead_time_variance: float) -> float:
        risk_score = 0.4 * (100.0 - otif_rate) + 0.4 * defect_rate + 0.2 * lead_time_variance
        return round(min(max(risk_score, 0.0), 100.0), 2)

    def analyze_suppliers(self, suppliers_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        flagged_suppliers = []
        recommendations = []
        
        for s in suppliers_data:
            otif = float(s.get("otif_rate", 100.0))
            defect = float(s.get("defect_rate", 0.0))
            lt_var = float(s.get("lead_time_variance", 0.0))
            risk_score = self.calculate_vendor_risk(otif, defect, lt_var)
            
            if otif < self.otif_threshold or risk_score > 30.0:
                flagged_suppliers.append({
                    "supplier_id": s.get("id"),
                    "name": s.get("company_name"),
                    "otif_rate": otif,
                    "risk_score": risk_score
                })
                recommendations.append(f"Diversify PO allocation away from {s.get('company_name')} (OTIF: {otif}%, Risk Score: {risk_score}).")

        risk_level = "LOW"
        if len(flagged_suppliers) >= 2:
            risk_level = "HIGH"
        elif len(flagged_suppliers) == 1:
            risk_level = "MEDIUM"

        return {
            "agent_name": "Procurement Agent",
            "risk_level": risk_level,
            "title": "Vendor OTIF & Lead-Time Sourcing Evaluation",
            "flagged_suppliers": flagged_suppliers,
            "reasoning": f"Evaluated {len(suppliers_data)} active suppliers. {len(flagged_suppliers)} vendor(s) breached risk tolerance thresholds.",
            "recommendations": recommendations if recommendations else ["Maintain existing procurement allocation; all suppliers meet OTIF benchmarks."],
            "confidence_score": 96.5 if risk_level == "LOW" else 92.0,
            "is_cached_fallback": False
        }
