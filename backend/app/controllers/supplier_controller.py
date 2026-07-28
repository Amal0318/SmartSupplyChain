from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.repositories.supplier_repository import SupplierRepository
from app.schemas.supplier import (
    SupplierCreate, SupplierResponse,
    SupplierCategoryCreate, SupplierCategoryResponse,
    SupplierContactCreate, SupplierContactResponse
)
from app.controllers.auth_controller import get_current_user
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/suppliers", tags=["Supplier Management"])


@router.get("", response_model=List[SupplierResponse])
def list_suppliers(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    category_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    repo = SupplierRepository(db)
    return repo.get_all(skip=skip, limit=limit, search=search, category_id=category_id)


@router.post("", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
def create_supplier(
    supplier_in: SupplierCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = SupplierRepository(db)
    if repo.get_by_code(supplier_in.code):
        raise HTTPException(status_code=400, detail="Supplier with this code already exists.")
    return repo.create(supplier_in)


@router.get("/categories", response_model=List[SupplierCategoryResponse])
def list_supplier_categories(db: Session = Depends(get_db)):
    repo = SupplierRepository(db)
    return repo.get_categories()


@router.post("/categories", response_model=SupplierCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_supplier_category(
    cat_in: SupplierCategoryCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = SupplierRepository(db)
    return repo.create_category(cat_in)


@router.post("/contacts", response_model=SupplierContactResponse, status_code=status.HTTP_201_CREATED)
def create_supplier_contact(
    contact_in: SupplierContactCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = SupplierRepository(db)
    return repo.create_contact(contact_in)


@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
def soft_delete_supplier(
    supplier_id: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = SupplierRepository(db)
    if not repo.soft_delete(supplier_id):
        raise HTTPException(status_code=404, detail="Supplier not found or already deleted.")
    return None
