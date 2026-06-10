# HealthModule

Owns liveness/readiness HTTP endpoints and operational smoke checks.

## Public API (cross-module)

No Nest `exports` yet. Shared types for consumers:

| Symbol | Location | Description |
|--------|----------|-------------|
| `ReadinessResponse` | `public/readiness-response.ts` | Readiness endpoint shape |

Import from: `src/modules/health/public` (barrel)

Readiness checks database connectivity via `DatabaseHealthPort` from Core `DatabaseModule`.

## HTTP API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Public | Root health check |
| `GET` | `/health/test` | Public | Smoke test |
| `GET` | `/health/ready` | Public | Readiness with database connectivity check |

## Dependencies

- Uses global `DatabaseModule` (`DATABASE_HEALTH` port) for readiness checks

## Private layers

- `application/` — `HealthService`
- `presentation/` — `HealthController`
