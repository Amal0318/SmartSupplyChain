"""
Production AI Agent — Authentication Service
=============================================
Business logic for user authentication including:
  - Login with credential verification
  - JWT token pair issuance
  - Token refresh
  - Logout (token invalidation via DB flag)
  - Admin seed user creation on first startup

Design:
  - Service calls repositories (never raw DB)
  - All auth decisions happen here, not in endpoints
  - Async throughout for non-blocking I/O
"""

import logging
from datetime import datetime, timezone
from typing import Tuple

from app.core.config import get_settings
from app.core.exceptions import (
    ConflictException,
    CredentialsException,
    NotFoundException,
    PermissionDeniedException,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)
from app.db.repositories.audit_repository import AuditRepository
from app.db.repositories.user_repository import UserRepository
from app.models.domain import AuditLogModel, UserModel, UserRole
from app.schemas.schemas import (
    CreateUserRequest,
    LoginRequest,
    TokenResponse,
    UserPublic,
)

logger = logging.getLogger(__name__)
settings = get_settings()


class AuthService:
    """
    Handles all authentication and authorization business logic.

    Dependencies injected via constructor (Dependency Injection pattern).
    """

    def __init__(
        self,
        user_repo: UserRepository,
        audit_repo: AuditRepository,
    ) -> None:
        self._user_repo = user_repo
        self._audit_repo = audit_repo

    # ---------------------------------------------------------------------------
    # Login
    # ---------------------------------------------------------------------------

    async def login(
        self,
        request: LoginRequest,
        ip_address: str = "",
        user_agent: str = "",
    ) -> TokenResponse:
        """
        Authenticate a user with email and password.

        Process:
          1. Find user by email
          2. Check is_active status
          3. Verify password hash
          4. Issue JWT access + refresh token pair
          5. Record last_login timestamp
          6. Write audit log

        Args:
            request:    LoginRequest containing email and password
            ip_address: Client IP for audit logging
            user_agent: Client User-Agent for audit logging

        Returns:
            TokenResponse with access token, refresh token, and user info

        Raises:
            CredentialsException: If email not found or password wrong
            PermissionDeniedException: If user account is deactivated
        """
        # Step 1: Find user
        user = await self._user_repo.find_by_email(request.email)

        # Step 2: Guard against user not found (generic message prevents enumeration)
        if user is None:
            await self._write_audit_log(
                user_id=None,
                user_email=request.email,
                action="LOGIN_FAILED",
                status="failure",
                details={"reason": "user_not_found"},
                ip_address=ip_address,
            )
            raise CredentialsException("Invalid email or password")

        # Step 3: Check active status
        if not user.is_active:
            await self._write_audit_log(
                user_id=str(user.id),
                user_email=user.email,
                action="LOGIN_FAILED",
                status="failure",
                details={"reason": "account_deactivated"},
                ip_address=ip_address,
            )
            raise PermissionDeniedException("Account is deactivated. Contact your administrator.")

        # Step 4: Verify password
        if not verify_password(request.password, user.password_hash):
            await self._write_audit_log(
                user_id=str(user.id),
                user_email=user.email,
                action="LOGIN_FAILED",
                status="failure",
                details={"reason": "wrong_password"},
                ip_address=ip_address,
            )
            raise CredentialsException("Invalid email or password")

        # Step 5: Issue tokens
        access_token = create_access_token(user_id=str(user.id), role=user.role.value)
        refresh_token = create_refresh_token(user_id=str(user.id))

        # Step 6: Update last_login
        await self._user_repo.record_login(str(user.id))

        # Step 7: Audit log
        await self._write_audit_log(
            user_id=str(user.id),
            user_email=user.email,
            action="LOGIN_SUCCESS",
            status="success",
            ip_address=ip_address,
        )

        logger.info("User logged in", extra={"user_id": str(user.id), "email": user.email})

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.jwt_access_token_expire_minutes * 60,
            user=UserPublic(
                id=str(user.id),
                email=user.email,
                full_name=user.full_name,
                role=user.role,
                is_active=user.is_active,
                created_at=user.created_at,
                last_login=user.last_login,
            ),
        )

    # ---------------------------------------------------------------------------
    # Token Refresh
    # ---------------------------------------------------------------------------

    async def refresh_tokens(self, refresh_token: str) -> Tuple[str, str]:
        """
        Issue a new token pair from a valid refresh token.

        Args:
            refresh_token: Valid JWT refresh token string

        Returns:
            Tuple of (new_access_token, new_refresh_token)

        Raises:
            CredentialsException: If refresh token is invalid
            NotFoundException:    If user no longer exists
        """
        # Decode and validate the refresh token
        user_id = decode_refresh_token(refresh_token)

        # Verify user still exists and is active
        user = await self._user_repo.find_by_id(user_id)
        if user is None or not user.is_active:
            raise CredentialsException("Invalid refresh token")

        # Issue fresh token pair
        new_access = create_access_token(user_id=str(user.id), role=user.role.value)
        new_refresh = create_refresh_token(user_id=str(user.id))

        logger.info("Tokens refreshed", extra={"user_id": user_id})
        return new_access, new_refresh

    # ---------------------------------------------------------------------------
    # Seed Admin User
    # ---------------------------------------------------------------------------

    async def seed_admin_user(self) -> None:
        """
        Create the default admin user if no users exist in the system.
        Called once during application startup.
        Safe to call on every restart — idempotent.
        """
        user_count = await self._user_repo.count()
        if user_count > 0:
            return  # Users already exist, skip seeding

        logger.info("No users found — seeding default admin user")

        admin = UserModel(
            email=settings.admin_email,
            password_hash=hash_password(settings.admin_password),
            full_name=settings.admin_full_name,
            role=UserRole.ADMIN,
            is_active=True,
        )

        try:
            created = await self._user_repo.create(admin)
            logger.info(
                "Default admin user created",
                extra={"user_id": str(created.id), "email": created.email},
            )
        except Exception as exc:
            logger.error("Failed to seed admin user", extra={"error": str(exc)})

    # ---------------------------------------------------------------------------
    # Private Helpers
    # ---------------------------------------------------------------------------

    async def _write_audit_log(
        self,
        action: str,
        status: str,
        user_id: str | None = None,
        user_email: str | None = None,
        ip_address: str = "",
        details: dict | None = None,
    ) -> None:
        """Write an audit log entry for an auth event."""
        try:
            entry = AuditLogModel(
                user_id=user_id,
                user_email=user_email,
                action=action,
                resource="auth",
                ip_address=ip_address,
                status=status,
                details=details,
            )
            await self._audit_repo.log(entry)
        except Exception as exc:
            # Never let audit logging failure break the main flow
            logger.error("Audit log write failed", extra={"error": str(exc)})
