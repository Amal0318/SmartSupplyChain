"""
Production AI Agent — Security Utilities
=========================================
Handles:
  - Password hashing and verification (bcrypt)
  - JWT access and refresh token creation / decoding
  - Current user extraction from request headers

Design decisions:
  - HS256 is used; swap to RS256 for multi-service environments
    by adding public/private key config to Settings
  - Refresh tokens are stored in the DB to enable revocation
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings
from app.core.exceptions import CredentialsException, TokenExpiredException

settings = get_settings()

# ---------------------------------------------------------------------------
# Password Hashing
# ---------------------------------------------------------------------------
_pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=settings.bcrypt_rounds,
)


def hash_password(plain_password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    return _pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against a bcrypt hash.
    Performs a constant-time comparison to prevent timing attacks.
    """
    return _pwd_context.verify(plain_password, hashed_password)


# ---------------------------------------------------------------------------
# JWT Tokens
# ---------------------------------------------------------------------------
def _create_token(
    subject: str,
    token_type: str,
    expires_delta: timedelta,
    extra_claims: Optional[dict] = None,
) -> str:
    """
    Internal helper to create a signed JWT token.

    Args:
        subject:       The token subject (usually user ID as string)
        token_type:    "access" or "refresh"
        expires_delta: How long until the token expires
        extra_claims:  Additional claims to embed (e.g., role)

    Returns:
        Signed JWT string
    """
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
    }
    if extra_claims:
        payload.update(extra_claims)

    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def create_access_token(user_id: str, role: str) -> str:
    """
    Create a short-lived JWT access token.

    Args:
        user_id: MongoDB ObjectId as string
        role:    User role (admin | manager | viewer)

    Returns:
        Signed access JWT string
    """
    return _create_token(
        subject=user_id,
        token_type="access",
        expires_delta=timedelta(minutes=settings.jwt_access_token_expire_minutes),
        extra_claims={"role": role},
    )


def create_refresh_token(user_id: str) -> str:
    """
    Create a long-lived JWT refresh token.

    Args:
        user_id: MongoDB ObjectId as string

    Returns:
        Signed refresh JWT string
    """
    return _create_token(
        subject=user_id,
        token_type="refresh",
        expires_delta=timedelta(days=settings.jwt_refresh_token_expire_days),
    )


def decode_access_token(token: str) -> dict:
    """
    Decode and validate a JWT access token.

    Args:
        token: Raw JWT string from Authorization header

    Returns:
        Decoded payload dict containing 'sub' and 'role'

    Raises:
        TokenExpiredException: If the token has expired
        CredentialsException:  If the token is invalid or malformed
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        if payload.get("type") != "access":
            raise CredentialsException("Invalid token type")

        user_id: Optional[str] = payload.get("sub")
        if not user_id:
            raise CredentialsException("Token missing subject")

        return payload

    except JWTError as exc:
        error_str = str(exc).lower()
        if "expired" in error_str:
            raise TokenExpiredException() from exc
        raise CredentialsException("Could not validate credentials") from exc


def decode_refresh_token(token: str) -> str:
    """
    Decode and validate a JWT refresh token, returning the user ID.

    Raises:
        TokenExpiredException: If token is expired
        CredentialsException:  If token is invalid
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        if payload.get("type") != "refresh":
            raise CredentialsException("Invalid token type for refresh")

        user_id: Optional[str] = payload.get("sub")
        if not user_id:
            raise CredentialsException("Refresh token missing subject")

        return user_id

    except JWTError as exc:
        error_str = str(exc).lower()
        if "expired" in error_str:
            raise TokenExpiredException() from exc
        raise CredentialsException("Could not validate refresh token") from exc
