from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.repositories.product_repository import ProductRepository
from app.schemas.product import (
    ProductCreate, ProductResponse,
    ProductCategoryCreate, ProductCategoryResponse,
    ProductBrandCreate, ProductBrandResponse,
    ProductUnitCreate, ProductUnitResponse
)
from app.controllers.auth_controller import get_current_user
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/products", tags=["Product Catalog Management"])


@router.get("", response_model=List[ProductResponse])
def list_products(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    category_id: Optional[str] = None,
    brand_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    repo = ProductRepository(db)
    return repo.get_all(skip=skip, limit=limit, search=search, category_id=category_id, brand_id=brand_id)


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = ProductRepository(db)
    if repo.get_by_sku(product_in.sku):
        raise HTTPException(status_code=400, detail="Product with this SKU already exists.")
    return repo.create(product_in)


@router.get("/categories", response_model=List[ProductCategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    repo = ProductRepository(db)
    return repo.get_all_categories()


@router.post("/categories", response_model=ProductCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    cat_in: ProductCategoryCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = ProductRepository(db)
    return repo.create_category(cat_in)


@router.get("/brands", response_model=List[ProductBrandResponse])
def list_brands(db: Session = Depends(get_db)):
    repo = ProductRepository(db)
    return repo.get_brands()


@router.post("/brands", response_model=ProductBrandResponse, status_code=status.HTTP_201_CREATED)
def create_brand(
    brand_in: ProductBrandCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = ProductRepository(db)
    return repo.create_brand(brand_in)


@router.get("/units", response_model=List[ProductUnitResponse])
def list_units(db: Session = Depends(get_db)):
    repo = ProductRepository(db)
    return repo.get_units()


@router.post("/units", response_model=ProductUnitResponse, status_code=status.HTTP_201_CREATED)
def create_unit(
    unit_in: ProductUnitCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = ProductRepository(db)
    return repo.create_unit(unit_in)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def soft_delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = ProductRepository(db)
    if not repo.soft_delete(product_id):
        raise HTTPException(status_code=404, detail="Product not found or already deleted.")
    return None
