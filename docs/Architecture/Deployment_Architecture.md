# 🐳 Deployment & Security Architecture

```
                               ┌───────────────────────────┐
                               │       Client Browser      │
                               └─────────────┬─────────────┘
                                             │ HTTPS (443)
                               ┌─────────────▼─────────────┐
                               │   Nginx Reverse Proxy /   │
                               │      SSL Termination      │
                               └─────────────┬─────────────┘
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      │ HTTP (8000)                                 │ HTTP (3000)
       ┌──────────────▼─────────────┐                ┌──────────────▼─────────────┐
       │   FastAPI Backend Container│                │ React Web App Container    │
       └──────────────┬─────────────┘                └────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
┌───────▼────────────┐      ┌───────▼────────────┐
│ PostgreSQL Storage │      │  Redis Cache Pod   │
└────────────────────┘      └────────────────────┘
```

## Containerization & Environment Configuration
- **Docker Compose**: Orchestrates multi-container local and production deployment (Backend, Frontend, PostgreSQL, Redis, Nginx).
- **Environment Management**: `.env` configuration files for database connection strings, JWT secrets, and API keys.
- **Nginx Proxying**: Handles SSL termination, Gzip compression, static asset serving, and request rate limiting.
