import sys
import os
import uuid
from datetime import datetime

# Set path to include backend root
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.database.session import engine, SessionLocal, Base
from app.models.user import Organization, User
from app.models.supplier import Supplier
from app.models.product import Product, ProductCategory
from app.models.inventory import Warehouse, InventoryItem
from app.models.warehouse import WarehouseZone, WarehouseBin
from app.models.procurement import PurchaseRequisition, PurchaseOrder
from app.models.production import ProductionLine, BOMHeader, WorkOrder
from app.models.logistics import Carrier, Shipment
from app.models.analytics import ExecutiveReport, DemandForecastPlaceholder
from app.core.security import get_password_hash


def seed_database():
    print("[INIT] Recreating Database Schema and Seeding Sample Enterprise Supply Chain Data...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Organization
        org = db.query(Organization).filter_by(code="APEX-GLOBAL").first()
        if not org:
            org = Organization(
                id=str(uuid.uuid4()),
                name="Apex Global Logistics & Manufacturing Corp",
                code="APEX-GLOBAL",
                description="Enterprise Smart Supply Chain Platform",
                is_active=True
            )
            db.add(org)
            db.commit()
            db.refresh(org)
            print(f"[OK] Organization created: {org.name}")

        # 2. Users
        admin_user = db.query(User).filter_by(email="admin@smartysupplychain.com").first()
        if not admin_user:
            admin_user = User(
                id=str(uuid.uuid4()),
                email="admin@smartysupplychain.com",
                hashed_password=get_password_hash("AdminPass123!"),
                first_name="Alexander",
                last_name="Vance",
                role="ADMIN",
                organization_id=org.id,
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print(f"[OK] User created: {admin_user.email} (Role: {admin_user.role})")

        # 3. Suppliers
        suppliers = []
        sup_data = [
            ("SUP-001", "Acme Precision Components", "electronics@acme.com", "+1-800-555-0199", 94.5, 5.0),
            ("SUP-002", "Titanium Raw Metals Ltd", "orders@titaniummetals.com", "+1-800-555-0288", 78.2, 12.0),
            ("SUP-003", "Apex Microelectronics Inc", "sales@apexmicro.com", "+1-800-555-0377", 98.0, 3.5)
        ]
        for code, name, email, phone, otif, lt in sup_data:
            s = db.query(Supplier).filter_by(code=code).first()
            if not s:
                s = Supplier(
                    id=str(uuid.uuid4()),
                    code=code,
                    company_name=name,
                    email=email,
                    phone=phone,
                    otif_rate=otif,
                    lead_time_days=lt,
                    is_active=True
                )
                db.add(s)
                suppliers.append(s)
        db.commit()
        print("[OK] Suppliers seeded.")

        # 4. Product Categories & Products
        cat = db.query(ProductCategory).filter_by(code="GENERAL").first()
        if not cat:
            cat = ProductCategory(
                id=str(uuid.uuid4()),
                name="General Components & Materials",
                code="GENERAL",
                description="Default Product Category"
            )
            db.add(cat)
            db.commit()
            db.refresh(cat)

        products = []
        prod_data = [
            ("SKU-9081", "High-Torque Electric Servo Motor", 450.00, 15),
            ("SKU-4022", "Industrial Grade Aluminum Alloy Chassis", 120.00, 50),
            ("SKU-1055", "Microcontroller Microprocessor Board v2", 85.00, 100)
        ]
        for sku, name, cost, reorder in prod_data:
            p = db.query(Product).filter_by(sku=sku).first()
            if not p:
                p = Product(
                    id=str(uuid.uuid4()),
                    category_id=cat.id,
                    sku=sku,
                    name=name,
                    unit_cost=cost,
                    reorder_level=reorder,
                    safety_stock=5,
                    is_active=True
                )
                db.add(p)
                products.append(p)
        db.commit()
        print("[OK] Products seeded.")

        # 5. Warehouses & Zones
        wh = db.query(Warehouse).filter_by(code="WH-MAIN-01").first()
        if not wh:
            wh = Warehouse(
                id=str(uuid.uuid4()),
                code="WH-MAIN-01",
                name="Central Distribution Hub - Chicago",
                location="Chicago, IL, USA",
                capacity=15000
            )
            db.add(wh)
            db.commit()
            db.refresh(wh)

            zone = WarehouseZone(
                id=str(uuid.uuid4()),
                warehouse_id=wh.id,
                name="High Turnover Zone A",
                code="ZONE-A",
                zone_type="STORAGE"
            )
            db.add(zone)
            db.commit()
            db.refresh(zone)

            bin1 = WarehouseBin(
                id=str(uuid.uuid4()),
                zone_id=zone.id,
                bin_code="BIN-A-101",
                barcode="BC-BIN-A-101",
                max_capacity=500,
                occupied_capacity=120,
                is_available=True
            )
            db.add(bin1)
            db.commit()
            print("[OK] Warehouse & Zones seeded.")

        # 6. Inventory Items
        if products:
            for p in products:
                item = db.query(InventoryItem).filter_by(product_id=p.id).first()
                if not item:
                    inv_item = InventoryItem(
                        id=str(uuid.uuid4()),
                        product_id=p.id,
                        warehouse_id=wh.id if wh else None,
                        quantity_on_hand=120 if p.sku != "SKU-9081" else 10,
                        quantity_allocated=20,
                        quantity_available=100 if p.sku != "SKU-9081" else 8
                    )
                    db.add(inv_item)
            db.commit()
            print("[OK] Inventory Items seeded.")

        # 7. Procurement Data (Requisitions, POs)
        pr = db.query(PurchaseRequisition).filter_by(pr_number="PR-2026-0001").first()
        if not pr and admin_user:
            pr = PurchaseRequisition(
                id=str(uuid.uuid4()),
                pr_number="PR-2026-0001",
                requested_by_id=admin_user.id,
                status="APPROVED",
                remarks="Urgent replenishment for Q3 Servo Motor assembly line."
            )
            db.add(pr)
            db.commit()

            po = PurchaseOrder(
                id=str(uuid.uuid4()),
                po_number="PO-2026-0001",
                pr_id=pr.id,
                supplier_id=suppliers[0].id if suppliers else str(uuid.uuid4()),
                status="APPROVED",
                total_amount=24500.00
            )
            db.add(po)
            db.commit()
            print("[OK] Procurement Requisitions & POs seeded.")

        # 8. Work Orders & Production Lines
        line = db.query(ProductionLine).filter_by(line_code="LINE-ALPHA-01").first()
        if not line:
            line = ProductionLine(
                id=str(uuid.uuid4()),
                line_code="LINE-ALPHA-01",
                name="Automated Robotic Assembly Line 1",
                capacity_per_hour=120,
                is_operational=True
            )
            db.add(line)
            db.commit()
            db.refresh(line)

        bom = db.query(BOMHeader).filter_by(bom_number="BOM-SERVO-01").first()
        if not bom and products:
            bom = BOMHeader(
                id=str(uuid.uuid4()),
                bom_number="BOM-SERVO-01",
                finished_good_id=products[0].id,
                version="1.0",
                is_active=True
            )
            db.add(bom)
            db.commit()
            db.refresh(bom)

        wo = db.query(WorkOrder).filter_by(wo_number="WO-2026-9901").first()
        if not wo and line and bom:
            wo = WorkOrder(
                id=str(uuid.uuid4()),
                wo_number="WO-2026-9901",
                bom_id=bom.id,
                line_id=line.id,
                target_quantity=500,
                produced_quantity=340,
                status="IN_PROGRESS"
            )
            db.add(wo)
            db.commit()
            print("[OK] Production Lines & Work Orders seeded.")

        # 9. Logistics Carrier & Shipments
        carrier = db.query(Carrier).filter_by(code="CARRIER-FEDEX").first()
        if not carrier:
            carrier = Carrier(
                id=str(uuid.uuid4()),
                code="CARRIER-FEDEX",
                company_name="FedEx Freight Priority",
                email="dispatch@fedex.com",
                phone="+1-800-463-3339",
                is_active=True
            )
            db.add(carrier)
            db.commit()
            db.refresh(carrier)

        sh = db.query(Shipment).filter_by(shipment_number="SH-2026-984029").first()
        if not sh and wh and carrier:
            sh = Shipment(
                id=str(uuid.uuid4()),
                shipment_number="SH-2026-984029",
                origin_warehouse_id=wh.id,
                destination_address="100 Enterprise Way, Dallas, TX 75201",
                carrier_id=carrier.id,
                status="IN_TRANSIT"
            )
            db.add(sh)
            db.commit()
            print("[OK] Logistics Carriers & Shipments seeded.")

        # 10. Analytics & Forecast Placeholders
        if products and admin_user:
            rep = db.query(ExecutiveReport).first()
            if not rep:
                rep = ExecutiveReport(
                    id=str(uuid.uuid4()),
                    title="Q3 Enterprise Supply Chain Audit Report",
                    report_type="CROSS_MODULE",
                    parameters="{\"period\": \"Q3-2026\"}",
                    generated_by_id=admin_user.id
                )
                db.add(rep)

            fc = db.query(DemandForecastPlaceholder).first()
            if not fc:
                fc = DemandForecastPlaceholder(
                    id=str(uuid.uuid4()),
                    product_id=products[0].id,
                    forecast_period="2026-Q3",
                    predicted_demand_qty=1500,
                    confidence_score=94.5,
                    algorithm_type="PROPHET_ARIMA_HYBRID"
                )
                db.add(fc)
            db.commit()
            print("[OK] Analytics & Demand Forecasts seeded.")

        print("[SUCCESS] Database successfully seeded with full enterprise supply chain dataset!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error during database seeding: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
