"""
Production AI Agent — Pytest Configuration & Test Fixtures
=========================================================
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock

from app.models.domain import UserModel, UserRole
from app.core.security import hash_password


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_user_repo():
    repo = MagicMock()
    repo.find_by_email = AsyncMock()
    repo.find_by_id = AsyncMock()
    repo.create = AsyncMock()
    repo.record_login = AsyncMock()
    repo.count = AsyncMock()
    return repo


@pytest.fixture
def mock_audit_repo():
    repo = MagicMock()
    repo.log = AsyncMock()
    return repo


@pytest.fixture
def sample_user():
    return UserModel(
        id="65b123456789abcdef012345",
        email="test@productionai.com",
        password_hash=hash_password("Password123!"),
        full_name="Test User",
        role=UserRole.MANAGER,
        is_active=True,
    )
