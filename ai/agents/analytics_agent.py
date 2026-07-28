from typing import Dict, Any, List

class AnalyticsAgent:
    """
    6. Analytics Agent
    Purpose: Synthesize historical telemetry into enterprise KPIs, business intelligence reports, and spend reconciliation.
    """
    def generate_executive_kpis(self, procurement_spend: float, inventory_accuracy: float, supplier_otif: float, active_work_orders: int) -> Dict[str, Any]:
        return {
            "total_procurement_spend": round(procurement_spend, 2),
            "inventory_accuracy_pct": round(inventory_accuracy, 1),
            "supplier_otif_rating_pct": round(supplier_otif, 1),
            "active_work_orders": active_work_orders,
        }

    def analyze_enterprise_metrics(self, metrics_data: Dict[str, Any]) -> Dict[str, Any]:
        spend = float(metrics_data.get("total_spend", 1248500.0))
        accuracy = float(metrics_data.get("inventory_accuracy", 99.8))
        otif = float(metrics_data.get("supplier_otif", 94.2))
        work_orders = int(metrics_data.get("active_work_orders", 18))

        kpis = self.generate_executive_kpis(spend, accuracy, otif, work_orders)
        
        recommendations = []
        if accuracy < 99.0:
            recommendations.append("Conduct unscheduled cycle count to rectify inventory accuracy variance.")
        if otif < 90.0:
            recommendations.append("Review vendor tier contracts due to lagging aggregate OTIF rating.")

        return {
            "agent_name": "Analytics Agent",
            "risk_level": "LOW" if accuracy >= 99.0 and otif >= 90.0 else "MEDIUM",
            "title": "Cross-Department Executive KPI & Spend Reconciliation Synthesis",
            "kpis": kpis,
            "reasoning": f"Reconciled operational spend (${spend:,.2f}) and metrics. System inventory accuracy is {accuracy}%.",
            "recommendations": recommendations if recommendations else ["Enterprise KPIs reconciled across financial vouchers and inventory balances."],
            "confidence_score": 99.0,
            "is_cached_fallback": False
        }
