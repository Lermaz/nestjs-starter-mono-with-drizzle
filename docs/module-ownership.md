# Module Ownership

One sentence per module — what it owns and what it does not own.

| Module | Owns |
|--------|------|
| **CoreModule** | App-wide config, global filters/interceptors, and platform wiring |
| **DatabaseModule** | Drizzle PostgreSQL connection, migrations on boot, and `DatabaseHealthPort` |
| **CommonModule** | Shared cross-cutting providers (filters, interceptors, event listeners) consumed by Core |
| **HealthModule** | Liveness/readiness HTTP endpoints and operational smoke checks |
| **AuthModule** | User registration/login, JWT issuance, `AuthPublicApi`, and the `users` table |
| **TodosModule** | Todo persistence, CRUD API, and the `todos` table |

## Module public API docs

- [TodosModule](../src/modules/todos/README.md)
- [AuthModule](../src/modules/auth/README.md)
- [HealthModule](../src/modules/health/README.md) — `public/` barrel for shared types

## Rules

- Cross-module calls go through a module's `public/` facade exported via `exports`.
- Feature modules never import another module's `infrastructure/` or `presentation/` layers.
- Each Drizzle schema file lives inside its owning feature module; schemas are never shared across modules at runtime.

## Domain layer conventions

- `domain/` is pure TypeScript — no NestJS, no Drizzle ORM, no HTTP DTOs.
- Repository ports speak domain types (`Todo`, `User`); row mapping lives in `infrastructure/mappers/`.
- DTO mapping stays in `presentation/` (controllers and response mappers).
- Application services orchestrate domain rules, ports, and integration events.
- `use-cases/` splits are deferred until a service exceeds ~150 lines.

## Database schemas

Module-owned `pgTable` definitions live in `infrastructure/schema/*.schema.ts`. The core barrel at `src/core/database/schema/index.ts` re-exports them for Drizzle Kit only. `todos` may reference `users` for FK definitions — that is schema-level coupling only. Other modules must use public facades (`TodosPublicApi`, `AuthPublicApi`), never import another module's schema or repository files.

See [scale path](./scale-path.md) for evolution beyond the modular monolith.
