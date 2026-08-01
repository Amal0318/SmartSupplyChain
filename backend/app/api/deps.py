"""
Production AI Agent — API Dependencies
======================================
FastAPI dependencies for:
  - Injecting database repositories and services
  - Authenticating requests via OAuth2 Bearer JWT token or query parameter
  - Enforcing Role-Based Access Control (RBAC)
"""

from typing import Annotated, Callable, Optional

from fastapi import Depends, Request, status
from fastapi.security import OAuth2PasswordBearer
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.exceptions import CredentialsException, PermissionDeniedException
from app.core.security import decode_access_token
from app.db.mongodb import get_database
from app.db.repositories.audit_repository import AuditRepository
from app.db.repositories.data_repository import (
    AIReportRepository,
    InventoryDataRepository,
    ProcurementDataRepository,
    ProductionOrderRepository,
)
from app.db.repositories.upload_repository import UploadRepository
from app.db.repositories.user_repository import UserRepository
from app.models.domain import UserModel, UserRole
from app.services.ai_service import AIService
from app.services.analytics_service import AnalyticsService
from app.services.auth_service import AuthService
from app.services.data_processing_service import DataProcessingService
from app.services.export_service import ExportService
from app.services.upload_service import UploadService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


# ---------------------------------------------------------------------------
# Repositories Dependencies
# ---------------------------------------------------------------------------

def get_user_repository(
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> UserRepository:
    return UserRepository(db)


def get_upload_repository(
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> UploadRepository:
    return UploadRepository(db)


def get_audit_repository(
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> AuditRepository:
    return AuditRepository(db)


def get_inventory_repository(
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> InventoryDataRepository:
    return InventoryDataRepository(db)


def get_procurement_repository(
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ProcurementDataRepository:
    return ProcurementDataRepository(db)


def get_production_repository(
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ProductionOrderRepository:
    return ProductionOrderRepository(db)


def get_ai_report_repository(
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> AIReportRepository:
    return AIReportRepository(db)


# ---------------------------------------------------------------------------
# Services Dependencies
# ---------------------------------------------------------------------------

def get_auth_service(
    user_repo: UserRepository = Depends(get_user_repository),
    audit_repo: AuditRepository = Depends(get_audit_repository),
) -> AuthService:
    return AuthService(user_repo=user_repo, audit_repo=audit_repo)


def get_upload_service(
    upload_repo: UploadRepository = Depends(get_upload_repository),
    audit_repo: AuditRepository = Depends(get_audit_repository),
) -> UploadService:
    return UploadService(upload_repo=upload_repo, audit_repo=audit_repo)


def get_data_processing_service(
    upload_repo: UploadRepository = Depends(get_upload_repository),
    inventory_repo: InventoryDataRepository = Depends(get_inventory_repository),
    procurement_repo: ProcurementDataRepository = Depends(get_procurement_repository),
    production_repo: ProductionOrderRepository = Depends(get_production_repository),
) -> DataProcessingService:
    return DataProcessingService(
        upload_repo=upload_repo,
        inventory_repo=inventory_repo,
        procurement_repo=procurement_repo,
        production_repo=production_repo,
    )


def get_analytics_service(
    inventory_repo: InventoryDataRepository = Depends(get_inventory_repository),
    procurement_repo: ProcurementDataRepository = Depends(get_procurement_repository),
    production_repo: ProductionOrderRepository = Depends(get_production_repository),
) -> AnalyticsService:
    return AnalyticsService(
        inventory_repo=inventory_repo,
        procurement_repo=procurement_repo,
        production_repo=production_repo,
    )


def get_ai_service(
    analytics_service: AnalyticsService = Depends(get_analytics_service),
    ai_repo: AIReportRepository = Depends(get_ai_report_repository),
) -> AIService:
    return AIService(analytics_service=analytics_service, ai_repo=ai_repo)


def get_export_service() -> ExportService:
    return ExportService()


# ---------------------------------------------------------------------------
# Authentication & User Context
# ---------------------------------------------------------------------------

async def get_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    user_repo: UserRepository = Depends(get_user_repository),
) -> UserModel:
    """
    Extract JWT bearer token from Authorization header or query string, validate it, and return user.
    """
    jwt_token = token
    if not jwt_token:
        jwt_token = request.query_params.get("token")

    if not jwt_token:
        raise CredentialsException("Could not validate credentials")

    payload = decode_access_token(jwt_token)
    user_id = payload.get("sub")
    if not user_id:
        raise CredentialsException("Invalid token payload")

    user = await user_repo.find_by_id(user_id)
    if not user:
        raise CredentialsException("User account not found")

    if not user.is_active:
        raise PermissionDeniedException("User account is inactive")

    return user


def require_roles(*allowed_roles: UserRole) -> Callable:
    async def role_checker(
        current_user: UserModel = Depends(get_current_user),
    ) -> UserModel:
        if current_user.role not in allowed_roles:
            raise PermissionDeniedException(
                f"Action requires one of the following roles: {[r.value for r in allowed_roles]}"
            )
        return current_user

    return role_checker


CurrentUser = Annotated[UserModel, Depends(get_current_user)]
