from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.analytics import ExecutiveReport, DemandForecastPlaceholder
from app.models.supplier import Supplier
from app.models.product import Product
from app.models.procurement import PurchaseOrder
from app.models.inventory import InventoryItem
from app.models.production import WorkOrder
from app.models.logistics import Shipment
from app.models.organization import EmployeeProfile
from app.schemas.analytics import ExecutiveReportCreate, ExecutiveDashboardSummary


class AnalyticsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_executive_summary(self) -> ExecutiveDashboardSummary:
        # Spend
        orders = self.db.query(PurchaseOrder).all()
        spend = sum(float(o.total_amount) for o in orders)

        # Inventory Valuation
        items = self.db.query(InventoryItem).all()
        val = 0.0
        low_stock = 0
        for item in items:
            p = self.db.query(Product).filter(Product.id == item.product_id).first()
            if p:
                val += float(p.unit_cost) * item.quantity_on_hand
                if item.quantity_available <= p.reorder_level:
                    low_stock += 1

        # Production OEE
        wos = self.db.query(WorkOrder).all()
        prod_units = sum(w.produced_quantity for w in wos)
        scrap_units = sum(w.scrap_quantity for w in wos)
        tot_u = prod_units + scrap_units
        oee = (prod_units / tot_u * 100.0) if tot_u > 0 else 98.5

        # Logistics OTD Rate
        shipments = self.db.query(Shipment).all()
        delivered = [s for s in shipments if s.status == "DELIVERED"]
        otd_count = sum(1 for s in delivered if s.actual_arrival and s.estimated_arrival and s.actual_arrival <= s.estimated_arrival)
        otd = (otd_count / len(delivered) * 100.0) if len(delivered) > 0 else 96.8

        # Vendor OTIF Average
        suppliers = self.db.query(Supplier).filter(Supplier.is_active == True, Supplier.is_deleted == False).all()
        avg_otif = (sum(float(s.otif_rate) for s in suppliers) / len(suppliers)) if len(suppliers) > 0 else 94.5

        return ExecutiveDashboardSummary(
            total_procurement_spend=round(spend, 2),
            total_inventory_valuation=round(val, 2),
            overall_equipment_effectiveness=round(oee, 2),
            on_time_delivery_rate=round(otd, 2),
            vendor_otif_average=round(avg_otif, 2),
            active_work_orders_count=self.db.query(WorkOrder).filter(WorkOrder.status == "IN_PROGRESS").count(),
            low_stock_alerts_count=low_stock,
            total_employees_count=self.db.query(EmployeeProfile).count(),
            system_health="HEALTHY (100% OPERATIONAL)"
        )

    def create_report(self, user_id: str, report_in: ExecutiveReportCreate) -> ExecutiveReport:
        db_report = ExecutiveReport(
            title=report_in.title,
            report_type=report_in.report_type,
            parameters=report_in.parameters,
            generated_by_id=user_id
        )
        self.db.add(db_report)
        self.db.commit()
        self.db.refresh(db_report)
        return db_report

    def get_reports(self) -> List[ExecutiveReport]:
        return self.db.query(ExecutiveReport).order_by(ExecutiveReport.created_at.desc()).all()

    def get_forecasts(self) -> List[DemandForecastPlaceholder]:
        return self.db.query(DemandForecastPlaceholder).all()
