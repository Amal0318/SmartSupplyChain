"""
Production AI Agent — Pydantic API Schemas
==========================================
Request and response schemas for all API endpoints.
These are separate from domain models (separation of concerns):
  - Domain models = internal DB representation
  - Schemas = API contract (what clients send/receive)
"""

from datetime import datetime
from typing import Generic, List, Optional, TypeVar
from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.domain import FileType, UploadStatus, UserRole, ValidationError


# =============================================================================
# Generic Paginated Response
# =============================================================================

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Standard paginated list response."""
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int


# =============================================================================
# Standard API Response Envelope
# =============================================================================


class SuccessResponse(BaseModel):
    """Generic success response with optional data payload."""
    success: bool = True
    message: str
    data: Optional[dict] = None


# =============================================================================
# Auth Schemas
# =============================================================================


class LoginRequest(BaseModel):
    """Request body for POST /auth/login"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=1, description="User password")


class TokenResponse(BaseModel):
    """Response body for successful authentication."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Access token lifetime in seconds")
    user: "UserPublic"


class RefreshTokenRequest(BaseModel):
    """Request body for POST /auth/refresh"""
    refresh_token: str


# =============================================================================
# User Schemas
# =============================================================================


class UserPublic(BaseModel):
    """
    Public user representation — safe to send to any authenticated client.
    Excludes password_hash and other sensitive fields.
    """
    id: str
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    model_config = {"from_attributes": True}


class CreateUserRequest(BaseModel):
    """Request body for POST /users — Admin only."""
    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimum 8 characters")
    full_name: str = Field(..., min_length=2, max_length=100)
    role: UserRole = UserRole.VIEWER

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        """Enforce basic password policy."""
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UpdateUserRequest(BaseModel):
    """Request body for PUT /users/{id} — Admin only."""
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class ChangePasswordRequest(BaseModel):
    """Request body for POST /users/me/change-password"""
    current_password: str
    new_password: str = Field(..., min_length=8)


# =============================================================================
# Upload Schemas
# =============================================================================


class UploadResponse(BaseModel):
    """Response after a successful file upload."""
    id: str
    file_type: FileType
    original_filename: str
    status: UploadStatus
    file_size_bytes: Optional[int] = None
    uploaded_at: datetime
    message: str = "File uploaded successfully. Validation in progress."

    model_config = {"from_attributes": True}


class UploadStatusResponse(BaseModel):
    """Detailed upload status including validation results."""
    id: str
    file_type: FileType
    original_filename: str
    status: UploadStatus
    row_count: Optional[int] = None
    file_size_bytes: Optional[int] = None
    validation_errors: List[ValidationError] = []
    uploaded_at: datetime
    validated_at: Optional[datetime] = None
    processed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class UploadHistoryItem(BaseModel):
    """Summary item for upload history list."""
    id: str
    file_type: FileType
    original_filename: str
    status: UploadStatus
    row_count: Optional[int] = None
    uploaded_at: datetime

    model_config = {"from_attributes": True}


# =============================================================================
# Health Check Schema
# =============================================================================


class ServiceHealth(BaseModel):
    """Health status of an individual service dependency."""
    name: str
    status: str  # "healthy" | "degraded" | "unhealthy"
    latency_ms: Optional[float] = None
    detail: Optional[str] = None


class HealthCheckResponse(BaseModel):
    """Response body for GET /health"""
    status: str          # "healthy" | "degraded" | "unhealthy"
    version: str
    environment: str
    timestamp: datetime
    services: List[ServiceHealth] = []


# =============================================================================
# Audit Log Schemas
# =============================================================================


class AuditLogResponse(BaseModel):
    """Public representation of an audit log entry."""
    id: str
    user_email: Optional[str] = None
    action: str
    resource: Optional[str] = None
    resource_id: Optional[str] = None
    timestamp: datetime
    ip_address: Optional[str] = None
    status: str
    details: Optional[dict] = None

    model_config = {"from_attributes": True}
