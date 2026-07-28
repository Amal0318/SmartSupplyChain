from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.production import (
    BOMHeader, BOMItem, ProductionLine, WorkOrder, MaterialConsumptionLog
)
from app.schemas.production import (
    BOMHeaderCreate, ProductionLineCreate, WorkOrderCreate, WorkOrderProgressUpdate, ProductionDashboardMetrics
)


class ProductionRepository:
    def __init__(self, db: Session):
        self.db = db

    # BOM CRUD
    def create_bom(self, bom_in: BOMHeaderCreate) -> BOMHeader:
        count = self.db.query(BOMHeader).count() + 1
        bom_num = f"BOM-2026-{count:04d}"
        
        db_bom = BOMHeader(
            bom_number=bom_num,
            finished_good_id=bom_in.finished_good_id,
            version=bom_in.version or "1.0"
        )
        self.db.add(db_bom)
        self.db.commit()
        self.db.refresh(db_bom)

        for item in bom_in.items:
            db_item = BOMItem(
                bom_header_id=db_bom.id,
                component_product_id=item.component_product_id,
                quantity_required=item.quantity_required,
                scrap_factor=item.scrap_factor
            )
            self.db.add(db_item)

        self.db.commit()
        self.db.refresh(db_bom)
        return db_bom

    def get_boms(self) -> List[BOMHeader]:
        return self.db.query(BOMHeader).all()

    # Production Lines
    def create_line(self, line_in: ProductionLineCreate) -> ProductionLine:
        db_line = ProductionLine(**line_in.model_dump())
        self.db.add(db_line)
        self.db.commit()
        self.db.refresh(db_line)
        return db_line

    def get_lines(self) -> List[ProductionLine]:
        return self.db.query(ProductionLine).all()

    # Work Orders
    def create_work_order(self, wo_in: WorkOrderCreate) -> WorkOrder:
        count = self.db.query(WorkOrder).count() + 1
        wo_num = f"WO-2026-{count:04d}"

        db_wo = WorkOrder(
            wo_number=wo_num,
            bom_id=wo_in.bom_id,
            line_id=wo_in.line_id,
            target_quantity=wo_in.target_quantity,
            status="IN_PROGRESS",
            start_time=datetime.now(timezone.utc)
        )
        self.db.add(db_wo)
        self.db.commit()
        self.db.refresh(db_wo)
        return db_wo

    def update_work_order_progress(self, update_in: WorkOrderProgressUpdate) -> Optional[WorkOrder]:
        wo = self.db.query(WorkOrder).filter(WorkOrder.id == update_in.wo_id).first()
        if not wo:
            return None

        wo.produced_quantity += update_in.produced_quantity
        wo.scrap_quantity += update_in.scrap_quantity

        if wo.produced_quantity >= wo.target_quantity:
            wo.status = "COMPLETED"
            wo.end_time = datetime.now(timezone.utc)

        # Log material consumption based on BOM ratio
        bom = self.db.query(BOMHeader).filter(BOMHeader.id == wo.bom_id).first()
        if bom:
            for item in bom.items:
                consumed_qty = float(item.quantity_required) * update_in.produced_quantity
                log = MaterialConsumptionLog(
                    wo_id=wo.id,
                    component_product_id=item.component_product_id,
                    quantity_consumed=consumed_qty
                )
                self.db.add(log)

        self.db.commit()
        self.db.refresh(wo)
        return wo

    def get_work_orders(self) -> List[WorkOrder]:
        return self.db.query(WorkOrder).all()

    # Dashboard Metrics
    def get_metrics(self) -> ProductionDashboardMetrics:
        orders = self.get_work_orders()
        total_produced = sum(o.produced_quantity for o in orders)
        total_scrap = sum(o.scrap_quantity for o in orders)
        active_wos = sum(1 for o in orders if o.status == "IN_PROGRESS")
        completed_wos = sum(1 for o in orders if o.status == "COMPLETED")

        total_units = total_produced + total_scrap
        oee = (total_produced / total_units * 100.0) if total_units > 0 else 98.5

        return ProductionDashboardMetrics(
            total_boms=self.db.query(BOMHeader).count(),
            active_work_orders=active_wos,
            completed_work_orders=completed_wos,
            overall_equipment_effectiveness=round(oee, 2),
            total_produced_units=total_produced,
            total_scrap_units=total_scrap
        )
