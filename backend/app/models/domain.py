"""
Production AI Agent — Pydantic Models
=======================================
Domain models representing MongoDB documents.
These are the internal data layer models (not API schemas).

Uses Pydantic v2 with custom validators and computed properties.
ObjectId fields are handled via PyObjectId annotation.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Annotated, Any, Optional

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


# =============================================================================
# Custom Types
# =============================================================================


class PyObjectId(str):
    """
    Custom type that serializes MongoDB ObjectId to/from string.
    Allows ObjectId fields to work cleanly with Pydantic v2.
    """

    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v: Any) -> str:
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str):
            if ObjectId.is_valid(v):
                return v
            raise ValueError(f"Invalid ObjectId: {v}")
        raise TypeError(f"ObjectId or string required, got {type(v)}")

    @classmethod
    def __get_pydantic_core_schema__(cls, source, handler):
        from pydantic_core import core_schema
        return core_schema.no_info_plain_validator_function(
            cls.validate,
            serialization=core_schema.to_string_ser_schema(),
        )


# =============================================================================
# Enumerations
# =============================================================================


class UserRole(str, Enum):
    """RBAC roles — ordered from least to most privileged."""
    VIEWER = "viewer"
    MANAGER = "manager"
    ADMIN = "admin"


class UploadStatus(str, Enum):
    """Lifecycle states of a CSV upload."""
    UPLOADED = "uploaded"
    VALIDATING = "validating"
    VALID = "valid"
    INVALID = "invalid"
    PROCESSING = "processing"
    PROCESSED = "processed"
    FAILED = "failed"


class FileType(str, Enum):
    """Types of CSV files the system accepts."""
    PROCUREMENT = "procurement"
    INVENTORY = "inventory"
    PRODUCTION_ORDERS = "production_orders"


# =============================================================================
# Base Model
# =============================================================================


class MongoBaseModel(BaseModel):
    """
    Base model for all MongoDB document models.
    Configures JSON serialization of ObjectId and datetime fields.
    """

    model_config = ConfigDict(
        populate_by_name=True,          # Accept both field name and alias
        arbitrary_types_allowed=True,   # Allow ObjectId type
        json_encoders={ObjectId: str},  # Serialize ObjectId as string
    )


# =============================================================================
# User Model
# =============================================================================


class UserModel(MongoBaseModel):
    """
    Represents a user document in the 'users' collection.
    """

    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    email: EmailStr
    password_hash: str
    full_name: str
    role: UserRole = UserRole.VIEWER
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None

    def to_dict(self) -> dict:
        """Serialize to dict suitable for MongoDB insertion."""
        data = self.model_dump(by_alias=True, exclude_none=True)
        if "id" in data and data["id"] is None:
            data.pop("id", None)
        return data


# =============================================================================
# Upload Model
# =============================================================================


class ValidationError(MongoBaseModel):
    """Represents a single validation error found in a CSV file."""
    row: Optional[int] = None
    column: Optional[str] = None
    message: str
    value: Optional[str] = None


class UploadModel(MongoBaseModel):
    """
    Represents a CSV file upload document in the 'uploads' collection.
    """

    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: PyObjectId
    file_type: FileType
    original_filename: str
    stored_path: str
    status: UploadStatus = UploadStatus.UPLOADED
    row_count: Optional[int] = None
    file_size_bytes: Optional[int] = None
    validation_errors: list[ValidationError] = Field(default_factory=list)
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    validated_at: Optional[datetime] = None
    processed_at: Optional[datetime] = None

    def to_dict(self) -> dict:
        """Serialize to dict suitable for MongoDB insertion."""
        data = self.model_dump(by_alias=True, exclude_none=True)
        if data.get("_id") is None:
            data.pop("_id", None)
        return data


# =============================================================================
# Audit Log Model
# =============================================================================


class AuditLogModel(MongoBaseModel):
    """
    Represents an audit log entry in the 'audit_logs' collection.
    All user actions are recorded here for compliance and traceability.
    """

    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: Optional[PyObjectId] = None
    user_email: Optional[str] = None
    action: str                          # e.g., "LOGIN", "UPLOAD_CSV", "RUN_ANALYSIS"
    resource: Optional[str] = None      # e.g., "upload", "user", "analysis"
    resource_id: Optional[str] = None   # ID of the affected resource
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    status: str = "success"             # "success" | "failure"
    details: Optional[dict] = None

    def to_dict(self) -> dict:
        """Serialize to dict suitable for MongoDB insertion."""
        data = self.model_dump(by_alias=True, exclude_none=True)
        if data.get("_id") is None:
            data.pop("_id", None)
        return data
