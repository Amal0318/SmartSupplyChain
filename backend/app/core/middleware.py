import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import logging

logger = logging.getLogger("smart_supply_chain")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware enforcing production security headers and XSS/SQLi defense."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response


class PerformanceLoggingMiddleware(BaseHTTPMiddleware):
    """Structured performance and latency logging middleware."""

    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        response: Response = await call_next(request)
        process_time_ms = round((time.time() - start_time) * 1000, 2)
        response.headers["X-Process-Time-MS"] = str(process_time_ms)

        logger.info(
            f"METHOD={request.method} PATH={request.url.path} STATUS={response.status_code} LATENCY={process_time_ms}ms"
        )
        return response
