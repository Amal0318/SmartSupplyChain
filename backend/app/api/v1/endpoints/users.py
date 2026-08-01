"""
Production AI Agent — User Management Endpoints
=================================================
REST API endpoints for managing system users (Admin only).
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import (
    CurrentUser,
    get_user_repository,
    require_roles,
)
from app.core.exceptions import ConflictException, NotFoundException
from app.core.security import hash_password
from app.db.repositories.user_repository import UserRepository
from app.models.domain import UserModel, UserRole
from app.schemas.schemas import (
    CreateUserRequest,
    PaginatedResponse,
    SuccessResponse,
    UpdateUserRequest,
    UserPublic,
)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "",
    response_model=PaginatedResponse[UserPublic],
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
    summary="List users (Admin only)",
)
async def list_users(
    role: Optional[UserRole] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_repo: UserRepository = Depends(get_user_repository),
):
    skip = (page - 1) * page_size
    users = await user_repo.find_all(role=role, is_active=is_active, skip=skip, limit=page_size)
    total = await user_repo.count(role=role, is_active=is_active)
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return PaginatedResponse[UserPublic](
        items=[UserPublic.model_validate(u) for u in users],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post(
    "",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
    summary="Create a new user (Admin only)",
)
async def create_user(
    body: CreateUserRequest,
    user_repo: UserRepository = Depends(get_user_repository),
):
    if await user_repo.email_exists(body.email):
        raise ConflictException(f"User with email '{body.email}' already exists")

    new_user = UserModel(
        email=body.email,
        password_hash=hash_password(body.password),
        full_name=body.full_name,
        role=body.role,
        is_active=True,
    )

    created = await user_repo.create(new_user)
    return UserPublic.model_validate(created)


@router.get(
    "/{user_id}",
    response_model=UserPublic,
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
    summary="Get user by ID (Admin only)",
)
async def get_user(
    user_id: str,
    user_repo: UserRepository = Depends(get_user_repository),
):
    user = await user_repo.find_by_id(user_id)
    if not user:
        raise NotFoundException("User", user_id)
    return UserPublic.model_validate(user)


@router.put(
    "/{user_id}",
    response_model=UserPublic,
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
    summary="Update user (Admin only)",
)
async def update_user(
    user_id: str,
    body: UpdateUserRequest,
    user_repo: UserRepository = Depends(get_user_repository),
):
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        user = await user_repo.find_by_id(user_id)
        if not user:
            raise NotFoundException("User", user_id)
        return UserPublic.model_validate(user)

    if "role" in updates and isinstance(updates["role"], UserRole):
        updates["role"] = updates["role"].value

    updated = await user_repo.update(user_id, updates)
    if not updated:
        raise NotFoundException("User", user_id)
    return UserPublic.model_validate(updated)


@router.delete(
    "/{user_id}",
    response_model=SuccessResponse,
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
    summary="Deactivate user (Admin only)",
)
async def deactivate_user(
    user_id: str,
    user_repo: UserRepository = Depends(get_user_repository),
):
    success = await user_repo.deactivate(user_id)
    if not success:
        raise NotFoundException("User", user_id)
    return SuccessResponse(message=f"User {user_id} deactivated successfully")
