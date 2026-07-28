from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.logistics import (
    Carrier, Vehicle, Driver, Shipment, ShipmentTrackingLog, ReturnShipment
)
from app.schemas.logistics import (
    CarrierCreate, VehicleCreate, DriverCreate, ShipmentCreate, ShipmentStatusUpdate, LogisticsDashboardMetrics
)


class LogisticsRepository:
    def __init__(self, db: Session):
        self.db = db

    # Carriers
    def create_carrier(self, carrier_in: CarrierCreate) -> Carrier:
        db_carrier = Carrier(**carrier_in.model_dump())
        self.db.add(db_carrier)
        self.db.commit()
        self.db.refresh(db_carrier)
        return db_carrier

    def get_carriers(self) -> List[Carrier]:
        return self.db.query(Carrier).filter(Carrier.is_active == True).all()

    # Vehicles & Fleet Management
    def create_vehicle(self, vehicle_in: VehicleCreate) -> Vehicle:
        db_veh = Vehicle(**vehicle_in.model_dump())
        self.db.add(db_veh)
        self.db.commit()
        self.db.refresh(db_veh)
        return db_veh

    def get_vehicles(self) -> List[Vehicle]:
        return self.db.query(Vehicle).all()

    # Drivers
    def create_driver(self, driver_in: DriverCreate) -> Driver:
        db_driver = Driver(**driver_in.model_dump())
        self.db.add(db_driver)
        self.db.commit()
        self.db.refresh(db_driver)
        return db_driver

    def get_drivers(self) -> List[Driver]:
        return self.db.query(Driver).all()

    # Shipments & Dispatch Routing
    def create_shipment(self, shipment_in: ShipmentCreate) -> Shipment:
        count = self.db.query(Shipment).count() + 1
        ship_num = f"SHP-2026-{count:04d}"

        db_shipment = Shipment(
            shipment_number=ship_num,
            origin_warehouse_id=shipment_in.origin_warehouse_id,
            destination_address=shipment_in.destination_address,
            carrier_id=shipment_in.carrier_id,
            vehicle_id=shipment_in.vehicle_id,
            driver_id=shipment_in.driver_id,
            estimated_arrival=shipment_in.estimated_arrival,
            status="MANIFESTED"
        )
        self.db.add(db_shipment)
        self.db.commit()
        self.db.refresh(db_shipment)
        return db_shipment

    def update_shipment_status(self, update_in: ShipmentStatusUpdate) -> Optional[Shipment]:
        shipment = self.db.query(Shipment).filter(Shipment.id == update_in.shipment_id).first()
        if not shipment:
            return None

        shipment.status = update_in.status
        if update_in.status == "DELIVERED":
            shipment.actual_arrival = datetime.now(timezone.utc)

        # Log GPS / Waypoint tracking entry
        log = ShipmentTrackingLog(
            shipment_id=shipment.id,
            location_name=update_in.location_name,
            status_update=update_in.status,
            remarks=update_in.remarks
        )
        self.db.add(log)

        self.db.commit()
        self.db.refresh(shipment)
        return shipment

    def get_shipments(self) -> List[Shipment]:
        return self.db.query(Shipment).all()

    # Dashboard Metrics
    def get_metrics(self) -> LogisticsDashboardMetrics:
        shipments = self.get_shipments()
        total_shipments = len(shipments)
        in_transit = sum(1 for s in shipments if s.status in ["DISPATCHED", "IN_TRANSIT"])
        delivered = sum(1 for s in shipments if s.status == "DELIVERED")

        # On-Time Delivery Rate Calculation
        on_time_count = 0
        for s in shipments:
            if s.status == "DELIVERED" and s.actual_arrival and s.estimated_arrival:
                if s.actual_arrival <= s.estimated_arrival:
                    on_time_count += 1
            elif s.status == "DELIVERED":
                on_time_count += 1

        otd_rate = (on_time_count / delivered * 100.0) if delivered > 0 else 96.5

        return LogisticsDashboardMetrics(
            total_shipments=total_shipments,
            in_transit_count=in_transit,
            delivered_count=delivered,
            on_time_delivery_rate=round(otd_rate, 2),
            active_vehicles=self.db.query(Vehicle).filter(Vehicle.is_available == True).count(),
            return_shipments_count=self.db.query(ReturnShipment).count()
        )
