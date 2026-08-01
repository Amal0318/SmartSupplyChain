"""
Production AI Agent — Custom Exceptions & HTTP Exception Handlers
=================================================================
Defines the application exception hierarchy and registers FastAPI
exception handlers that return consistent JSON error responses.

All error responses follow this structure:
  {
    "error": "ErrorCode",
    "message": "Human-readable description",
    "detail": {...}   # Optional, only in debug mode
  }
"""

import logging
from typing import Any, Optional

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


# =============================================================================
# Exception Hierarchy
# =============================================================================


class ProductionAIException(Exception):
    """Base exception for all application-specific errors."""

    def __init__(
        self,
        message: str,
        error_code: str = "INTERNAL_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail: Optional[Any] = None,
    ):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.detail = detail
        super().__init__(message)


# ---------------------------------------------------------------------------
# Authentication & Authorization
# ---------------------------------------------------------------------------


class CredentialsException(ProductionAIException):
    """Raised when JWT credentials are invalid or missing."""

    def __init__(self, message: str = "Could not validate credentials"):
        super().__init__(
            message=message,
            error_code="INVALID_CREDENTIALS",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class TokenExpiredException(ProductionAIException):
    """Raised when a JWT token has expired."""

    def __init__(self, message: str = "Token has expired"):
        super().__init__(
            message=message,
            error_code="TOKEN_EXPIRED",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class PermissionDeniedException(ProductionAIException):
    """Raised when a user lacks the required role for an action."""

    def __init__(self, message: str = "You do not have permission to perform this action"):
        super().__init__(
            message=message,
            error_code="PERMISSION_DENIED",
            status_code=status.HTTP_403_FORBIDDEN,
        )


# ---------------------------------------------------------------------------
# Resource Errors
# ---------------------------------------------------------------------------


class NotFoundException(ProductionAIException):
    """Raised when a requested resource does not exist."""

    def __init__(self, resource: str = "Resource", resource_id: str = ""):
        msg = f"{resource} not found"
        if resource_id:
            msg = f"{resource} with ID '{resource_id}' not found"
        super().__init__(
            message=msg,
            error_code="NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
        )


class ConflictException(ProductionAIException):
    """Raised when creating a resource that already exists."""

    def __init__(self, message: str = "Resource already exists"):
        super().__init__(
            message=message,
            error_code="CONFLICT",
            status_code=status.HTTP_409_CONFLICT,
        )


# ---------------------------------------------------------------------------
# Business Logic Errors
# ---------------------------------------------------------------------------


class ValidationException(ProductionAIException):
    """Raised when business rule validation fails."""

    def __init__(self, message: str, detail: Optional[Any] = None):
        super().__init__(
            message=message,
            error_code="VALIDATION_ERROR",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
        )


class CSVValidationException(ProductionAIException):
    """Raised when CSV file fails schema or data validation."""

    def __init__(self, message: str, errors: Optional[list] = None):
        super().__init__(
            message=message,
            error_code="CSV_VALIDATION_FAILED",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"errors": errors or []},
        )


class FileSizeException(ProductionAIException):
    """Raised when an uploaded file exceeds size limits."""

    def __init__(self, max_mb: int):
        super().__init__(
            message=f"File exceeds maximum allowed size of {max_mb} MB",
            error_code="FILE_TOO_LARGE",
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
        )


class UnsupportedFileTypeException(ProductionAIException):
    """Raised when an uploaded file has an unsupported extension."""

    def __init__(self, allowed: list):
        super().__init__(
            message=f"Unsupported file type. Allowed: {', '.join(allowed)}",
            error_code="UNSUPPORTED_FILE_TYPE",
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
        )


# =============================================================================
# FastAPI Exception Handlers
# =============================================================================


def _error_response(
    status_code: int,
    error_code: str,
    message: str,
    detail: Optional[Any] = None,
) -> JSONResponse:
    """Build a standardized JSON error response."""
    content: dict = {"error": error_code, "message": message}
    if detail is not None:
        content["detail"] = detail
    return JSONResponse(status_code=status_code, content=content)


def register_exception_handlers(app: FastAPI) -> None:
    """
    Register all custom exception handlers on the FastAPI application.
    Call this once during app startup.
    """

    @app.exception_handler(ProductionAIException)
    async def handle_app_exception(
        request: Request, exc: ProductionAIException
    ) -> JSONResponse:
        """Handle all application-specific exceptions."""
        logger.warning(
            "Application exception",
            extra={
                "error_code": exc.error_code,
                "exc_message": exc.message,
                "path": request.url.path,
                "method": request.method,
            },
        )
        return _error_response(
            status_code=exc.status_code,
            error_code=exc.error_code,
            message=exc.message,
            detail=exc.detail,
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        """Handle Pydantic request validation errors with clear messages."""
        errors = [
            {
                "field": ".".join(str(loc) for loc in error["loc"]),
                "message": error["msg"],
                "type": error["type"],
            }
            for error in exc.errors()
        ]
        logger.warning(
            "Request validation failed",
            extra={"path": request.url.path, "errors": errors},
        )
        return _error_response(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code="REQUEST_VALIDATION_ERROR",
            message="Request data validation failed",
            detail={"errors": errors},
        )

    @app.exception_handler(Exception)
    async def handle_unhandled_exception(
        request: Request, exc: Exception
    ) -> JSONResponse:
        """Catch-all handler for unexpected exceptions."""
        logger.exception(
            "Unhandled exception",
            extra={"path": request.url.path, "method": request.method},
        )
        return _error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="INTERNAL_SERVER_ERROR",
            message="An unexpected error occurred. Please try again later.",
        )
