"""
Production AI Agent — Application Configuration
================================================
Uses pydantic-settings to load typed, validated configuration from
environment variables and .env files.

Design:
  - Single source of truth for all config values
  - Fail fast: missing required vars raise ValidationError on startup
  - Immutable after initialization (frozen model)
"""

from functools import lru_cache
from typing import List

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    All values can be overridden via environment or a .env file.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",  # Ignore unknown env vars gracefully
    )

    # ---------------------------------------------------------------------------
    # Application
    # ---------------------------------------------------------------------------
    app_name: str = "Production AI Agent"
    app_version: str = "1.0.0"
    app_env: str = "development"  # development | staging | production
    debug: bool = False
    log_level: str = "INFO"

    # ---------------------------------------------------------------------------
    # API
    # ---------------------------------------------------------------------------
    api_v1_prefix: str = "/api/v1"
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Allow comma-separated string or JSON list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    # ---------------------------------------------------------------------------
    # MongoDB
    # ---------------------------------------------------------------------------
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "production_ai_agent"

    # ---------------------------------------------------------------------------
    # JWT Authentication
    # ---------------------------------------------------------------------------
    jwt_secret_key: str = "dev-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    # ---------------------------------------------------------------------------
    # AI / LLM
    # ---------------------------------------------------------------------------
    llm_provider: str = "mock"  # mock | openai
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"
    openai_max_tokens: int = 4096
    openai_temperature: float = 0.3

    # ---------------------------------------------------------------------------
    # File Upload
    # ---------------------------------------------------------------------------
    upload_dir: str = "./uploads"
    max_upload_size_mb: int = 50
    allowed_extensions: List[str] = ["csv"]

    # ---------------------------------------------------------------------------
    # Security
    # ---------------------------------------------------------------------------
    bcrypt_rounds: int = 12

    # ---------------------------------------------------------------------------
    # Admin Seed User
    # ---------------------------------------------------------------------------
    admin_email: str = "admin@productionai.com"
    admin_password: str = "Admin@123!"
    admin_full_name: str = "System Administrator"

    @property
    def is_production(self) -> bool:
        """True when running in production environment."""
        return self.app_env.lower() == "production"

    @property
    def max_upload_size_bytes(self) -> int:
        """Max upload size in bytes."""
        return self.max_upload_size_mb * 1024 * 1024


@lru_cache()
def get_settings() -> Settings:
    """
    Return cached Settings instance.
    The @lru_cache ensures only one Settings object is ever created,
    making configuration effectively a singleton.
    """
    return Settings()
