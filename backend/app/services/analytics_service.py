"""
Production AI Agent — Supply Chain & Production Analytics Service
===================================================================
Calculates metrics, stockout risks, schedule adherence, and operational KPIs
from stored inventory, procurement, and production data.
"""

import logging
from typing import Any, Dict, List

from app.db.repositories.data_repository import (
    InventoryDataRepository,
    ProcurementDataRepository,
    ProductionOrderRepository,
)

logger = logging.getLogger(__name__)


class AnalyticsService:
    """
    Business logic for calculating Warehouse Analytics & Production Analytics metrics.
    """

    def __init__(
        self,
        inventory_repo: InventoryDataRepository,
        procurement_repo: ProcurementDataRepository,
        production_repo: ProductionOrderRepository,
    ) -> None:
        self._inventory_repo = inventory_repo
        self._procurement_repo = procurement_repo
        self._production_repo = production_repo

    async def get_warehouse_analytics(self) -> Dict[str, Any]:
        """
        Calculate Warehouse Analytics KPIs, stockout alerts, and inventory metrics.
        """
        inventory_list = await self._inventory_repo.get_all(limit=5000)
        procurement_list = await self._procurement_repo.get_all(limit=5000)

        total_items = len(inventory_list)
        total_valuation = sum(item.get("total_valuation", 0.0) for item in inventory_list)

        stockout_items = []
        available_count = 0

        for item in inventory_list:
            stock = item.get("stock_on_hand", 0.0)
            reorder = item.get("reorder_point", 0.0)
            available = item.get("available_stock", stock)

            if available >= reorder:
                available_count += 1
            else:
                stockout_items.append({
                    "material_id": item.get("material_id", "N/A"),
                    "material_name": item.get("material_name", "N/A"),
                    "category": item.get("category", "General"),
                    "stock_on_hand": stock,
                    "available_stock": available,
                    "reorder_point": reorder,
                    "deficit": round(reorder - available, 2),
                    "unit_cost": item.get("unit_cost", 0.0),
                    "location": item.get("warehouse_location", "Main"),
                })

        availability_rate = round((available_count / total_items) * 100, 1) if total_items > 0 else 0.0

        # Aggregate Supplier Performance
        suppliers_map: Dict[str, Dict[str, Any]] = {}
        for p in procurement_list:
            sup = p.get("supplier_name", "Unknown Supplier")
            if sup not in suppliers_map:
                suppliers_map[sup] = {
                    "supplier_name": sup,
                    "total_pos": 0,
                    "delivered_pos": 0,
                    "total_spend": 0.0,
                }
            suppliers_map[sup]["total_pos"] += 1
            suppliers_map[sup]["total_spend"] += p.get("total_cost", 0.0)
            if p.get("status") in ["received", "completed", "delivered"]:
                suppliers_map[sup]["delivered_pos"] += 1

        supplier_performance = []
        for sup, data in suppliers_map.items():
            on_time_pct = round((data["delivered_pos"] / data["total_pos"]) * 100, 1) if data["total_pos"] > 0 else 0.0
            supplier_performance.append({
                "supplier_name": sup,
                "total_orders": data["total_pos"],
                "fulfillment_rate": on_time_pct,
                "total_spend": round(data["total_spend"], 2),
            })

        return {
            "summary": {
                "total_materials_tracked": total_items,
                "material_availability_rate": availability_rate,
                "total_stock_valuation": round(total_valuation, 2),
                "stockout_risk_count": len(stockout_items),
            },
            "stockout_risk_items": stockout_items,
            "supplier_performance": supplier_performance,
            "inventory_breakdown": inventory_list[:100],  # Return up to 100 items for table display
        }

    async def get_production_analytics(self) -> Dict[str, Any]:
        """
        Calculate Production Analytics KPIs, machine utilization, and schedule adherence.
        """
        orders = await self._production_repo.get_all(limit=5000)
        total_orders = len(orders)

        completed = sum(1 for o in orders if o.get("status") in ["completed", "done", "finished"])
        in_progress = sum(1 for o in orders if o.get("status") in ["in_progress", "active", "running"])
        delayed = sum(1 for o in orders if o.get("status") in ["delayed", "late", "blocked"])
        planned = sum(1 for o in orders if o.get("status") in ["planned", "scheduled"])

        total_planned_qty = sum(o.get("quantity_planned", 0.0) for o in orders)
        total_produced_qty = sum(o.get("quantity_produced", 0.0) for o in orders)

        adherence_rate = round((total_produced_qty / total_planned_qty) * 100, 1) if total_planned_qty > 0 else 0.0

        # Machine utilization grouping
        machines_map: Dict[str, Dict[str, Any]] = {}
        for o in orders:
            m_id = o.get("machine_id", "Default Machine")
            if m_id not in machines_map:
                machines_map[m_id] = {
                    "machine_id": m_id,
                    "order_count": 0,
                    "planned_units": 0.0,
                    "produced_units": 0.0,
                }
            machines_map[m_id]["order_count"] += 1
            machines_map[m_id]["planned_units"] += o.get("quantity_planned", 0.0)
            machines_map[m_id]["produced_units"] += o.get("quantity_produced", 0.0)

        machine_utilization = []
        for m_id, m_data in machines_map.items():
            efficiency = round((m_data["produced_units"] / m_data["planned_units"]) * 100, 1) if m_data["planned_units"] > 0 else 0.0
            machine_utilization.append({
                "machine_id": m_id,
                "order_count": m_data["order_count"],
                "planned_units": m_data["planned_units"],
                "produced_units": m_data["produced_units"],
                "efficiency_pct": efficiency,
            })

        # Identify bottleneck or delayed orders
        delay_risks = [
            {
                "order_number": o.get("order_number"),
                "product_id": o.get("product_id"),
                "machine_id": o.get("machine_id"),
                "status": o.get("status"),
                "quantity_planned": o.get("quantity_planned"),
                "quantity_produced": o.get("quantity_produced"),
                "adherence_pct": o.get("adherence_pct"),
            }
            for o in orders
            if o.get("status") in ["delayed", "late", "blocked"] or o.get("adherence_pct", 100) < 75.0
        ]

        return {
            "summary": {
                "total_production_orders": total_orders,
                "schedule_adherence_rate": adherence_rate,
                "completed_orders": completed,
                "in_progress_orders": in_progress,
                "delayed_orders": delayed,
                "planned_orders": planned,
            },
            "machine_utilization": machine_utilization,
            "delay_risks": delay_risks,
            "production_orders": orders[:100],
        }
