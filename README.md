# nestjs-starter-mono

A production-oriented **NestJS modular monolith** starter with enforced module boundaries, JWT auth, user-scoped todos, MikroORM migrations, and security hardening out of the box.

Built as a reference implementation for clean architecture in a single deployable: domain-driven feature modules, repository ports, public facades for cross-module access, and automated architecture checks in CI.

## Tech stack

| Layer      | Choice                                           |
| ---------- | ------------------------------------------------ |
| Runtime    | Node.js 22, TypeScript 5                         |
| Framework  | NestJS 11                                        |
| ORM        | MikroORM 7 (SQLite)                              |
| Auth       | JWT (Passport), bcrypt                           |
| Validation | class-validator, class-transformer               |
| API docs   | Swagger (dev / opt-in prod)                      |
| Security   | helmet, CORS, rate limiting, env validation      |
| Tooling    | pnpm, ESLint, Prettier, dependency-cruiser, Jest |

## Architecture

```
AppModule
├── CoreModule      → config, database, global guards/filters/interceptors
├── AuthModule      → registration, login, JWT, users table
├── HealthModule    → liveness / readiness
└── TodosModule     → user-scoped todo CRUD, integration events
```

Each feature module follows:

```
modules/<feature>/
  domain/           # pure TypeScript — models, rules, factories
  application/      # services, ports, events
  infrastructure/   # entities, repositories, listeners
  presentation/     # controllers, DTOs, mappers
  public/           # cross-module facade + exported types
```

**Boundary rules** (enforced by `pnpm arch:check`):

- Domain layer cannot import NestJS or MikroORM
- Application layer cannot import presentation DTOs or ORM entities
- Cross-module imports go through `public/` barrels only

Further reading:

- [Module ownership](docs/module-ownership.md)
- [Scale path](docs/scale-path.md)

## API overview

### Auth (`/auth`)

| Method | Path             | Auth   | Description                   |
| ------ | ---------------- | ------ | ----------------------------- |
| `POST` | `/auth/register` | Public | Register; returns JWT (5/min) |
| `POST` | `/auth/login`    | Public | Login; returns JWT (5/min)    |

### Todos (`/todos`)

All todo routes require `Authorization: Bearer <token>`. Todos are scoped to the authenticated user.

| Method   | Path         | Description                                                 |
| -------- | ------------ | ----------------------------------------------------------- |
| `POST`   | `/todos`     | Create todo (30/min)                                        |
| `GET`    | `/todos`     | List with cursor pagination (`?cursor=&limit=`, default 20) |
| `GET`    | `/todos/:id` | Get by id (owner only)                                      |
| `PATCH`  | `/todos/:id` | Partial update (30/min)                                     |
| `DELETE` | `/todos/:id` | Delete (30/min, 204)                                        |

`GET /todos` returns `{ items, nextCursor }`.

### Health

| Method | Path                | Description                             |
| ------ | ------------------- | --------------------------------------- |
| `GET`  | `/`                 | Liveness                                |
| `GET`  | `/health/ready`     | Readiness + database connectivity       |
| `GET`  | `/health/test`      | Module smoke test (non-production only) |
| `GET`  | `/todos/admin/test` | Module smoke test (non-production only) |

### Error shape

All errors return a consistent JSON body:

```json
{
  "statusCode": 400,
  "message": "Human-readable message",
  "timestamp": "2026-06-10T12:00:00.000Z",
  "path": "/todos"
}
```

## Security

- Global JWT guard with `@Public()` opt-out
- User-scoped todo queries (no cross-user IDOR)
- JWT re-validates user existence on each request
- Rate limiting: 100/min global; stricter limits on auth and write endpoints
- helmet, 100kb body limits, opt-in CORS via `CORS_ORIGINS`
- Production fails on missing/default `JWT_SECRET`
- Swagger disabled in production unless `ENABLE_SWAGGER=true`
- Email normalization; unified credential errors; password length cap (72 chars)
- Smoke test routes return 404 in production

## Getting started

### Prerequisites

- Node.js 22+
- pnpm 9+

### Local development

```bash
cp .env.example .env
# Set JWT_SECRET (any non-empty value is fine for local dev)

pnpm install
pnpm start:dev
```

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`

### Environment variables

| Variable         | Required (prod) | Description                                      |
| ---------------- | --------------- | ------------------------------------------------ |
| `JWT_SECRET`     | Yes             | Signing key; must not be the default placeholder |
| `DATABASE_URL`   | Yes             | SQLite path, e.g. `sqlite://./data/app.db`       |
| `NODE_ENV`       | No              | `development` (default) or `production`          |
| `PORT`           | No              | HTTP port (default `3000`)                       |
| `CORS_ORIGINS`   | No              | Comma-separated allowed origins                  |
| `ENABLE_SWAGGER` | No              | Set `true` to expose `/docs` in production       |
| `JWT_EXPIRES_IN` | No              | Token lifetime (default `1d`)                    |
| `BCRYPT_ROUNDS`  | No              | bcrypt cost factor (default `10`)                |

## Docker

```bash
cp .env.example .env
# Edit .env — JWT_SECRET is required in production

docker compose up --build
```

SQLite data persists in `./data`. The compose file loads secrets from `.env` (not committed).

```bash
# Manual image build
docker build -t nestjs-starter-mono .
docker run -p 3000:3000 --env-file .env nestjs-starter-mono
```

## Scripts

| Command                 | Description                       |
| ----------------------- | --------------------------------- |
| `pnpm start:dev`        | Dev server with watch             |
| `pnpm start:prod`       | Run compiled `dist/main.js`       |
| `pnpm build`            | Compile TypeScript                |
| `pnpm lint`             | ESLint                            |
| `pnpm test`             | Unit tests (Jest)                 |
| `pnpm test:e2e`         | End-to-end tests                  |
| `pnpm test:cov`         | Coverage report                   |
| `pnpm arch:check`       | dependency-cruiser boundary rules |
| `pnpm migration:create` | Generate MikroORM migration       |
| `pnpm migration:up`     | Apply pending migrations          |
| `pnpm migration:down`   | Revert last migration             |

## CI pipeline

On every push and PR (`.github/workflows/ci.yml`):

1. `pnpm audit --audit-level high`
2. `pnpm lint`
3. `pnpm test`
4. `pnpm build`
5. `pnpm arch:check`
6. `pnpm test:e2e`

## Database migrations

Migrations run automatically on application startup via `DatabaseMigrationService`.

```bash
# After entity/schema changes
pnpm migration:create
pnpm migration:up
```

Migration files live in `src/migrations/` and are copied to `dist/migrations/` on build.

## Project layout

```
src/
  app.module.ts
  main.ts
  core/                 # config, database, HTTP security bootstrap
  common/               # shared decorators, filters, guards, Result type
  modules/
    auth/
    health/
    todos/
  migrations/
test/
  e2e/                  # API integration tests
docs/                   # architecture guides
```

## Adding a feature module

1. Create `src/modules/<feature>/` with `domain`, `application`, `infrastructure`, `presentation`, `public`
2. Export only facades/types from `public/index.ts`
3. Wire the module in `AppModule`
4. Add a module `README.md` and a CODEOWNERS entry
5. Add unit + e2e tests; ensure `pnpm arch:check` passes

See [module ownership](docs/module-ownership.md) for conventions.

## License

UNLICENSED — private project.
