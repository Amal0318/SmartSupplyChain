"""
Production AI Agent — Structured Logging
==========================================
Configures Python's standard logging with structlog for structured,
JSON-formatted log output suitable for log aggregation tools
(Datadog, ELK, CloudWatch, etc.).

Features:
  - JSON output in production, human-readable in development
  - Automatic context injection (timestamp, level, logger name)
  - Correlation ID support for request tracing
  - Log level controlled by settings
"""

import logging
import sys
from typing import Optional

import structlog

from app.core.config import get_settings

settings = get_settings()


def configure_logging() -> None:
    """
    Configure structlog and standard library logging.
    Call this once at application startup (before any loggers are used).
    """
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)

    # ---------------------------------------------------------------------------
    # Standard library logging configuration
    # ---------------------------------------------------------------------------
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=log_level,
    )

    # Silence noisy third-party loggers
    for noisy_logger in ["uvicorn.access", "multipart", "pymongo"]:
        logging.getLogger(noisy_logger).setLevel(logging.WARNING)

    # ---------------------------------------------------------------------------
    # Structlog processors chain
    # ---------------------------------------------------------------------------
    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
    ]

    if settings.app_env == "production":
        # JSON output for log aggregation
        processors = [
            *shared_processors,
            structlog.processors.dict_tracebacks,
            structlog.processors.JSONRenderer(),
        ]
    else:
        # Human-readable colored output for development
        processors = [
            *shared_processors,
            structlog.dev.ConsoleRenderer(colors=True),
        ]

    structlog.configure(
        processors=processors,  # type: ignore[arg-type]
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: Optional[str] = None) -> structlog.stdlib.BoundLogger:
    """
    Get a named structlog logger.

    Usage:
        logger = get_logger(__name__)
        logger.info("Event happened", user_id="123", action="upload")

    Args:
        name: Logger name (use __name__ for module-level loggers)

    Returns:
        Bound structlog logger
    """
    return structlog.get_logger(name)
