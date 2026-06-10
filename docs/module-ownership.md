# Module Ownership

One sentence per module — what it owns and what it does not own.

| Module | Owns |
|--------|------|
| **CoreModule** | App-wide config, global filters/interceptors, and platform wiring |
| **DatabaseModule** | MikroORM connection, migrations on boot, and `DatabaseHealthPort` |
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
- Each entity file lives inside its owning feature module; entities are never shared across modules.

## Domain layer conventions

- `domain/` is pure TypeScript — no NestJS, no MikroORM, no HTTP DTOs.
- Repository ports speak domain types (`Todo`, `User`); entity mapping lives in `infrastructure/mappers/`.
- DTO mapping stays in `presentation/` (controllers and response mappers).
- Application services orchestrate domain rules, ports, and integration events.
- `use-cases/` splits are deferred until a service exceeds ~150 lines.

## Database entities

MikroORM discovers entities via a global glob at boot (`./dist/**/*.entity.js`), but ownership is per feature module. `TodoEntity` belongs to TodosModule only — other modules must use `TodosPublicApi` (or future facades), never import `*.entity.ts` files directly.

See [modular-nestjs-roadmap.md](./modular-nestjs-roadmap.md) for the full architecture roadmap.
