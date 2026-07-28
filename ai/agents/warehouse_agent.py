from typing import Dict, Any, List

class WarehouseAgent:
    """
    3. Warehouse Agent
    Purpose: Rack/bin putaway optimization, capacity utilization tracking, and quarantine GRN inspection logic.
    """
    def analyze_warehouse_operations(self, warehouses_data: List[Dict[str, Any]], grns_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        high_capacity_warehouses = []
        quarantine_pending = []
        recommendations = []

        for wh in warehouses_data:
            capacity_pct = float(wh.get("capacity_utilization_pct", 0.0))
            if capacity_pct > 85.0:
                high_capacity_warehouses.append({
                    "warehouse_id": wh.get("id"),
                    "name": wh.get("name"),
                    "utilization_pct": capacity_pct
                })
                recommendations.append(f"Rebalance putaway storage from {wh.get('name')} (Utilization: {capacity_pct}%).")

        for grn in grns_data:
            if grn.get("status") == "IN_QUARANTINE":
                quarantine_pending.append(grn.get("grn_number"))

        if quarantine_pending:
            recommendations.append(f"Expedite quality inspection for {len(quarantine_pending)} pending GRN(s): {', '.join(quarantine_pending[:3])}.")

        risk_level = "LOW"
        if len(high_capacity_warehouses) > 0 or len(quarantine_pending) > 2:
            risk_level = "MEDIUM"

        return {
            "agent_name": "Warehouse Agent",
            "risk_level": risk_level,
            "title": "Warehouse Capacity Heatmap & Bin Storage Putaway Optimization",
            "high_capacity_warehouses": high_capacity_warehouses,
            "quarantine_pending_count": len(quarantine_pending),
            "reasoning": f"Evaluated warehouse capacity utilization and {len(grns_data)} GRN receipt(s). {len(quarantine_pending)} items currently in quality quarantine.",
            "recommendations": recommendations if recommendations else ["Warehouse storage allocation and quarantine clearance are operating normally."],
            "confidence_score": 97.0,
            "is_cached_fallback": False
        }
