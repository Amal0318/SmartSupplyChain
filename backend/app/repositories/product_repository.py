from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.product import Product, ProductCategory, ProductBrand, ProductUnit, ProductSpecification
from app.schemas.product import (
    ProductCreate, ProductCategoryCreate, ProductBrandCreate, ProductUnitCreate, ProductSpecificationCreate
)


class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, product_id: str) -> Optional[Product]:
        return self.db.query(Product).filter(Product.id == product_id, Product.is_deleted == False).first()

    def get_by_sku(self, sku: str) -> Optional[Product]:
        return self.db.query(Product).filter(Product.sku == sku, Product.is_deleted == False).first()

    def get_all(
        self, 
        skip: int = 0, 
        limit: int = 100, 
        search: Optional[str] = None,
        category_id: Optional[str] = None,
        brand_id: Optional[str] = None
    ) -> List[Product]:
        query = self.db.query(Product).filter(Product.is_deleted == False)
        if category_id:
            query = query.filter(Product.category_id == category_id)
        if brand_id:
            query = query.filter(Product.brand_id == brand_id)
        if search:
            query = query.filter(
                (Product.name.ilike(f"%{search}%")) |
                (Product.sku.ilike(f"%{search}%"))
            )
        return query.offset(skip).limit(limit).all()

    def create(self, product_in: ProductCreate) -> Product:
        db_product = Product(
            sku=product_in.sku,
            name=product_in.name,
            description=product_in.description,
            image_url=product_in.image_url,
            unit_of_measure=product_in.unit_of_measure,
            unit_cost=product_in.unit_cost,
            reorder_level=product_in.reorder_level,
            safety_stock=product_in.safety_stock,
            category_id=product_in.category_id,
            brand_id=product_in.brand_id
        )
        self.db.add(db_product)
        self.db.commit()
        self.db.refresh(db_product)
        return db_product

    def soft_delete(self, product_id: str) -> bool:
        product = self.get_by_id(product_id)
        if not product:
            return False
        product.is_deleted = True
        product.deleted_at = datetime.now(timezone.utc)
        self.db.commit()
        return True

    # Categories
    def create_category(self, cat_in: ProductCategoryCreate) -> ProductCategory:
        db_cat = ProductCategory(**cat_in.model_dump())
        self.db.add(db_cat)
        self.db.commit()
        self.db.refresh(db_cat)
        return db_cat

    def get_all_categories(self) -> List[ProductCategory]:
        return self.db.query(ProductCategory).all()

    # Brands
    def create_brand(self, brand_in: ProductBrandCreate) -> ProductBrand:
        db_brand = ProductBrand(**brand_in.model_dump())
        self.db.add(db_brand)
        self.db.commit()
        self.db.refresh(db_brand)
        return db_brand

    def get_brands(self) -> List[ProductBrand]:
        return self.db.query(ProductBrand).all()

    # Units
    def create_unit(self, unit_in: ProductUnitCreate) -> ProductUnit:
        db_unit = ProductUnit(**unit_in.model_dump())
        self.db.add(db_unit)
        self.db.commit()
        self.db.refresh(db_unit)
        return db_unit

    def get_units(self) -> List[ProductUnit]:
        return self.db.query(ProductUnit).all()
