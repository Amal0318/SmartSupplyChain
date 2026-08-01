"""
Production AI Agent — Authentication Service Unit Tests
=========================================================
"""

import pytest
from app.services.auth_service import AuthService
from app.schemas.schemas import LoginRequest
from app.core.exceptions import CredentialsException, PermissionDeniedException


@pytest.mark.asyncio
async def test_login_success(mock_user_repo, mock_audit_repo, sample_user):
    mock_user_repo.find_by_email.return_value = sample_user
    auth_service = AuthService(mock_user_repo, mock_audit_repo)

    req = LoginRequest(email="test@productionai.com", password="Password123!")
    res = await auth_service.login(req, ip_address="127.0.0.1")

    assert res.access_token is not None
    assert res.refresh_token is not None
    assert res.user.email == sample_user.email
    mock_user_repo.record_login.assert_called_once_with(str(sample_user.id))
    mock_audit_repo.log.assert_called_once()


@pytest.mark.asyncio
async def test_login_wrong_password(mock_user_repo, mock_audit_repo, sample_user):
    mock_user_repo.find_by_email.return_value = sample_user
    auth_service = AuthService(mock_user_repo, mock_audit_repo)

    req = LoginRequest(email="test@productionai.com", password="WrongPassword!")
    
    with pytest.raises(CredentialsException):
        await auth_service.login(req)


@pytest.mark.asyncio
async def test_login_deactivated_account(mock_user_repo, mock_audit_repo, sample_user):
    sample_user.is_active = False
    mock_user_repo.find_by_email.return_value = sample_user
    auth_service = AuthService(mock_user_repo, mock_audit_repo)

    req = LoginRequest(email="test@productionai.com", password="Password123!")
    
    with pytest.raises(PermissionDeniedException):
        await auth_service.login(req)
