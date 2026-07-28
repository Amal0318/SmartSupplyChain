from typing import Dict, Any, List

class InventoryAgent:
    """
    2. Inventory Agent
    Purpose: SKU balance monitoring, automated reorder point triggers, demand forecasting.
    Decision Logic: Reorder Qty = (Avg Daily Consumption * Lead Time Days) + Safety Stock - On-Hand Qty
    """
    def calculate_reorder_quantity(self, avg_daily_consumption: float, lead_time_days: int, safety_stock: float, on_hand: float) -> float:
        needed = (avg_daily_consumption * lead_time_days) + safety_stock - on_hand
        return round(max(needed, 0.0), 2)

    def analyze_inventory(self, inventory_items: List[Dict[str, Any]]) -> Dict[str, Any]:
        low_stock_items = []
        recommendations = []

        for item in inventory_items:
            qty_available = float(item.get("quantity_available", 0))
            reorder_level = float(item.get("reorder_level", 10))
            avg_daily = float(item.get("avg_daily_consumption", 5.0))
            lead_time = int(item.get("lead_time_days", 7))
            safety_stock = float(item.get("safety_stock", 15.0))

            if qty_available <= reorder_level:
                suggested_reorder = self.calculate_reorder_quantity(avg_daily, lead_time, safety_stock, qty_available)
                low_stock_items.append({
                    "product_id": item.get("product_id"),
                    "sku": item.get("sku"),
                    "name": item.get("name"),
                    "available": qty_available,
                    "reorder_level": reorder_level,
                    "suggested_reorder_qty": suggested_reorder
                })
                recommendations.append(f"Trigger PR for SKU {item.get('sku')} ({item.get('name')}) - Reorder Qty: {suggested_reorder} units.")

        risk_level = "LOW"
        if len(low_stock_items) >= 3:
            risk_level = "HIGH"
        elif len(low_stock_items) > 0:
            risk_level = "MEDIUM"

        return {
            "agent_name": "Inventory Agent",
            "risk_level": risk_level,
            "title": "SKU Stock Balance & Automated Reorder Point Analysis",
            "low_stock_count": len(low_stock_items),
            "low_stock_items": low_stock_items,
            "reasoning": f"Audited {len(inventory_items)} SKUs. Identified {len(low_stock_items)} item(s) at or below safety stock threshold.",
            "recommendations": recommendations if recommendations else ["All SKU balances are healthy; no emergency purchase requisitions required."],
            "confidence_score": 98.0 if risk_level == "LOW" else 94.0,
            "is_cached_fallback": False
        }
