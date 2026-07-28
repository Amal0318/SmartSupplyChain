import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Numeric, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database.session import Base


def generate_uuid():
    return str(uuid.uuid4())


class Carrier(Base):
    __tablename__ = "carriers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, nullable=False, index=True)
    company_name = Column(String(255), nullable=False)
    contact_person = Column(String(100), nullable=True)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)

    vehicles = relationship("Vehicle", back_populates="carrier")
    shipments = relationship("Shipment", back_populates="carrier")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    vehicle_number = Column(String(50), unique=True, nullable=False, index=True)
    carrier_id = Column(String(36), ForeignKey("carriers.id"), nullable=False)
    vehicle_type = Column(String(50), default="TRUCK")  # VAN, TRUCK, REFRIGERATED_TRUCK, CONTAINER
    capacity_kg = Column(Integer, default=5000)
    is_available = Column(Boolean, default=True)

    carrier = relationship("Carrier", back_populates="vehicles")
    shipments = relationship("Shipment", back_populates="vehicle")


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    driver_code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=False)
    license_number = Column(String(100), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)

    shipments = relationship("Shipment", back_populates="driver")


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    shipment_number = Column(String(100), unique=True, nullable=False, index=True)
    origin_warehouse_id = Column(String(36), ForeignKey("warehouses.id"), nullable=False)
    destination_address = Column(Text, nullable=False)
    carrier_id = Column(String(36), ForeignKey("carriers.id"), nullable=False)
    vehicle_id = Column(String(36), ForeignKey("vehicles.id"), nullable=True)
    driver_id = Column(String(36), ForeignKey("drivers.id"), nullable=True)
    status = Column(String(50), default="MANIFESTED")  # MANIFESTED, DISPATCHED, IN_TRANSIT, DELIVERED, FAILED, RETURNED
    estimated_arrival = Column(DateTime, nullable=True)
    actual_arrival = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    carrier = relationship("Carrier", back_populates="shipments")
    vehicle = relationship("Vehicle", back_populates="shipments")
    driver = relationship("Driver", back_populates="shipments")
    tracking_logs = relationship("ShipmentTrackingLog", back_populates="shipment")
    returns = relationship("ReturnShipment", back_populates="shipment")


class ShipmentTrackingLog(Base):
    __tablename__ = "shipment_tracking_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    shipment_id = Column(String(36), ForeignKey("shipments.id"), nullable=False)
    location_name = Column(String(255), nullable=False)
    status_update = Column(String(50), nullable=False)
    remarks = Column(Text, nullable=True)
    logged_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    shipment = relationship("Shipment", back_populates="tracking_logs")


class ReturnShipment(Base):
    __tablename__ = "return_shipments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    return_number = Column(String(100), unique=True, nullable=False, index=True)
    shipment_id = Column(String(36), ForeignKey("shipments.id"), nullable=False)
    return_reason = Column(Text, nullable=False)
    status = Column(String(50), default="INITIATED")  # INITIATED, IN_TRANSIT, RECEIVED_AT_WAREHOUSE
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    shipment = relationship("Shipment", back_populates="returns")
