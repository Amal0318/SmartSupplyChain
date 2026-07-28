from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.supplier import Supplier, SupplierCategory, SupplierContact
from app.schemas.supplier import SupplierCreate, SupplierCategoryCreate, SupplierContactCreate


class SupplierRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, supplier_id: str) -> Optional[Supplier]:
        return self.db.query(Supplier).filter(Supplier.id == supplier_id, Supplier.is_deleted == False).first()

    def get_by_code(self, code: str) -> Optional[Supplier]:
        return self.db.query(Supplier).filter(Supplier.code == code, Supplier.is_deleted == False).first()

    def get_all(
        self, 
        skip: int = 0, 
        limit: int = 100, 
        search: Optional[str] = None,
        category_id: Optional[str] = None
    ) -> List[Supplier]:
        query = self.db.query(Supplier).filter(Supplier.is_deleted == False)
        if category_id:
            query = query.filter(Supplier.category_id == category_id)
        if search:
            query = query.filter(
                (Supplier.company_name.ilike(f"%{search}%")) |
                (Supplier.code.ilike(f"%{search}%")) |
                (Supplier.email.ilike(f"%{search}%"))
            )
        return query.offset(skip).limit(limit).all()

    def create(self, supplier_in: SupplierCreate) -> Supplier:
        db_supplier = Supplier(
            code=supplier_in.code,
            company_name=supplier_in.company_name,
            contact_person=supplier_in.contact_person,
            email=supplier_in.email,
            phone=supplier_in.phone,
            address=supplier_in.address,
            lead_time_days=supplier_in.lead_time_days,
            category_id=supplier_in.category_id
        )
        self.db.add(db_supplier)
        self.db.commit()
        self.db.refresh(db_supplier)
        return db_supplier

    def soft_delete(self, supplier_id: str) -> bool:
        supplier = self.get_by_id(supplier_id)
        if not supplier:
            return False
        supplier.is_deleted = True
        supplier.deleted_at = datetime.now(timezone.utc)
        self.db.commit()
        return True

    # Supplier Categories
    def create_category(self, cat_in: SupplierCategoryCreate) -> SupplierCategory:
        db_cat = SupplierCategory(**cat_in.model_dump())
        self.db.add(db_cat)
        self.db.commit()
        self.db.refresh(db_cat)
        return db_cat

    def get_categories(self) -> List[SupplierCategory]:
        return self.db.query(SupplierCategory).all()

    # Supplier Contacts
    def create_contact(self, contact_in: SupplierContactCreate) -> SupplierContact:
        db_contact = SupplierContact(**contact_in.model_dump())
        self.db.add(db_contact)
        self.db.commit()
        self.db.refresh(db_contact)
        return db_contact
