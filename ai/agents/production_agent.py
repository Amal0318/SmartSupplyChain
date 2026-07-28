from typing import Dict, Any, List

class ProductionAgent:
    """
    4. Production Agent
    Purpose: Factory production work order monitoring, machine utilization, BOM raw material reservation verification.
    Business Rule: Work order status cannot transition to IN_PROGRESS unless 100% of raw materials are reserved.
    """
    def verify_bom_reservation(self, required_materials: List[Dict[str, Any]]) -> bool:
        for mat in required_materials:
            if float(mat.get("reserved_qty", 0.0)) < float(mat.get("required_qty", 0.0)):
                return False
        return True

    def analyze_production_lines(self, work_orders: List[Dict[str, Any]]) -> Dict[str, Any]:
        delayed_orders = []
        material_shortage_orders = []
        recommendations = []

        for wo in work_orders:
            wo_number = wo.get("wo_number")
            status = wo.get("status")
            materials = wo.get("required_materials", [])

            is_reserved = self.verify_bom_reservation(materials)
            if not is_reserved and status == "PLANNED":
                material_shortage_orders.append(wo_number)
                recommendations.append(f"Hold execution of Work Order {wo_number}; 100% BOM raw material reservation incomplete.")

            if status == "DELAYED":
                delayed_orders.append(wo_number)

        risk_level = "LOW"
        if len(material_shortage_orders) > 0 or len(delayed_orders) > 0:
            risk_level = "HIGH" if len(delayed_orders) > 1 else "MEDIUM"

        return {
            "agent_name": "Production Agent",
            "risk_level": risk_level,
            "title": "Work Order Schedule Efficiency & Material Shortage Risk",
            "delayed_orders_count": len(delayed_orders),
            "material_shortage_count": len(material_shortage_orders),
            "reasoning": f"Audited {len(work_orders)} work orders. Found {len(material_shortage_orders)} order(s) missing full BOM material reservation.",
            "recommendations": recommendations if recommendations else ["Factory production schedule running cleanly; all planned work orders fully reserved."],
            "confidence_score": 95.5,
            "is_cached_fallback": False
        }
