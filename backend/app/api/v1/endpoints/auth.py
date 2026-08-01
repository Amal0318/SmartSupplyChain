"""
Production AI Agent — Authentication Endpoints
================================================
REST API endpoints for login, token refresh, and auth operations.
"""

from fastapi import APIRouter, Depends, Request, status

from app.api.deps import CurrentUser, get_auth_service
from app.schemas.schemas import (
    LoginRequest,
    RefreshTokenRequest,
    SuccessResponse,
    TokenResponse,
    UserPublic,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user and return JWT tokens",
)
async def login(
    request: Request,
    body: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    client_ip = request.client.host if request.client else ""
    user_agent = request.headers.get("user-agent", "")
    return await auth_service.login(
        request=body,
        ip_address=client_ip,
        user_agent=user_agent,
    )


@router.post(
    "/refresh",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token using refresh token",
)
async def refresh_token(
    body: RefreshTokenRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    access_token, refresh_token = await auth_service.refresh_tokens(body.refresh_token)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.get(
    "/me",
    response_model=UserPublic,
    status_code=status.HTTP_200_OK,
    summary="Get profile of currently logged-in user",
)
async def get_current_user_profile(current_user: CurrentUser) -> UserPublic:
    return UserPublic.model_validate(current_user)
