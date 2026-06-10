# MikroORM → Drizzle + PostgreSQL Migration Plan

Migration plan for replacing **MikroORM 7 (SQLite)** with **Drizzle ORM + PostgreSQL** in this NestJS modular monolith, while preserving the existing hexagonal architecture (domain ports, infrastructure adapters, module ownership).

**Status:** Completed (2026-06-10)  
**Target stack:** `drizzle-orm`, `drizzle-kit`, `pg` (node-postgres), PostgreSQL 16+

## Completion summary

| Phase | Outcome |
|-------|---------|
| 1 | Drizzle deps, `drizzle.config.ts`, Postgres in Docker Compose |
| 2 | Module-owned `pgTable` schemas + initial `drizzle/` SQL migration |
| 3 | `DatabaseModule` Drizzle provider, boot migrations, health adapter |
| 4 | `DrizzleUserRepository` / `DrizzleTodoRepository`; MikroORM removed |
| 5 | Versioned SQL in `drizzle/`; `pnpm db:generate` / `db:migrate` workflow |
| 6 | All `@mikro-orm/*` packages and artifacts deleted |
| 7 | E2e uses in-process PGlite; CI unchanged (no Docker required in CI) |

**Runtime:** PostgreSQL only (`DATABASE_URL=postgresql://...`). E2e tests override Drizzle with PGlite.

---

## Table of contents

1. [Current state](#1-current-state)
2. [Target state](#2-target-state)
3. [Why Drizzle fits this project](#3-why-drizzle-fits-this-project)
4. [Drizzle feature map](#4-drizzle-feature-map)
5. [Architecture decisions](#5-architecture-decisions)
6. [Phase 0 — Prerequisites](#phase-0--prerequisites)
7. [Phase 1 — Dependencies & PostgreSQL](#phase-1--dependencies--postgresql)
8. [Phase 2 — Schema (replace Mikro entities)](#phase-2--schema-replace-mikro-entities)
9. [Phase 3 — Core database module](#phase-3--core-database-module)
10. [Phase 4 — Repository adapters](#phase-4--repository-adapters)
11. [Phase 5 — Migrations](#phase-5--migrations)
12. [Phase 6 — Remove MikroORM](#phase-6--remove-mikroorm)
13. [Phase 7 — Tests & CI](#phase-7--tests--ci)
14. [File change checklist](#file-change-checklist)
15. [MikroORM → Drizzle query cheat sheet](#mikroorm--drizzle-query-cheat-sheet)
16. [Risks & open questions](#risks--open-questions)
17. [References](#references)

---

## 1. Current state

| Area | Today |
|------|-------|
| ORM | MikroORM 7 (`@mikro-orm/sqlite`) |
| Database | SQLite (`DATABASE_URL=sqlite://./data/app.db`) |
| Entities | `UserEntity`, `TodoEntity` (decorator classes in feature modules) |
| Repositories | `MikroUserRepository`, `MikroTodoRepository` (inject `EntityManager`) |
| Migrations | MikroORM TS migrations in `src/migrations/`, auto-run on boot |
| Request scope | `MikroOrmMiddleware` forks `EntityManager` per HTTP request |
| Health | `MikroDatabaseHealthAdapter` → `select 1` |
| Architecture | Ports in `application/`, adapters in `infrastructure/`, domain is ORM-free |

**Tables (after Mikro migrations):**

| Table | Columns | Constraints |
|-------|---------|-------------|
| `users` | `id`, `email`, `password_hash`, `created_at` | PK `id` (uuid text), unique `email` |
| `todos` | `id`, `user_id`, `title`, `is_completed`, `created_at` | PK `id`, FK `user_id → users.id` (restrict), index on `user_id` |

**MikroORM touchpoints (remove or replace):**

```
mikro-orm.config.ts
src/core/database/mikro-orm.config.ts
src/core/database/database.module.ts
src/core/database/database-migration.service.ts
src/core/database/adapters/mikro-database-health.adapter.ts
src/core/core.module.ts                    # MikroOrmMiddleware
src/modules/auth/auth.module.ts            # MikroOrmModule.forFeature
src/modules/todos/todos.module.ts
src/modules/*/infrastructure/entities/*.entity.ts
src/modules/*/infrastructure/repositories/mikro-*.repository.ts
src/migrations/Migration*.ts
src/migrations/.snapshot-*.json
package.json                               # @mikro-orm/* deps & scripts
```

---

## 2. Target state

| Area | Target |
|------|--------|
| ORM | Drizzle ORM (`drizzle-orm/node-postgres`) |
| Driver | `pg` (`Pool`) — mature, works well with NestJS lifecycle |
| Database | PostgreSQL (`DATABASE_URL=postgresql://...`) |
| Schema | `pgTable` definitions per feature module (exported for drizzle-kit) |
| Repositories | `DrizzleUserRepository`, `DrizzleTodoRepository` (inject `DrizzleDb`) |
| Migrations | SQL via drizzle-kit (`generate` + `migrate`), run on boot in prod |
| Request scope | **Not required** — Drizzle is stateless; use `Pool` + explicit transactions when needed |
| Health | `DrizzleDatabaseHealthAdapter` → `db.execute(sql\`select 1\`)` |
| Architecture | **Unchanged** — same ports, mappers, module boundaries |

**Recommended folder layout (module-owned schemas):**

```
src/
├── core/
│   └── database/
│       ├── database.module.ts
│       ├── drizzle.provider.ts          # DRIZZLE_DB token + Pool factory
│       ├── drizzle-migrate.service.ts   # programmatic migrate on boot
│       ├── adapters/drizzle-database-health.adapter.ts
│       └── schema/
│           └── index.ts                 # re-exports all module schemas (for drizzle-kit)
├── modules/
│   ├── auth/infrastructure/schema/users.schema.ts
│   └── todos/infrastructure/schema/todos.schema.ts
drizzle/                                 # generated SQL migrations (drizzle-kit out)
drizzle.config.ts
```

---

## 3. Why Drizzle fits this project

The codebase already follows **ports & adapters**. MikroORM’s `EntityManager`, identity map, and request-scoped middleware are not central to the design — repositories hide persistence. Drizzle maps cleanly:

- **Schema as TypeScript** replaces decorator entities; mappers stay the same shape.
- **SQL-first queries** match explicit repository methods (no magic lazy loading).
- **drizzle-kit** replaces Mikro CLI + snapshot diff with `generate` / `migrate`.
- **PostgreSQL** is the production target; SQLite was a starter convenience.

No NestJS official Drizzle module exists — a thin `DatabaseModule` with a custom provider is the standard pattern and matches how this project already wraps MikroORM.

---

## 4. Drizzle feature map

Features from Drizzle docs relevant to this project and near-term growth.

### 4.1 Core (use now)

| Feature | Doc slug | Use in this project |
|---------|----------|---------------------|
| PostgreSQL + node-postgres | `docs/get-started-postgresql` | Primary connection via `Pool` + `drizzle({ client: pool })` |
| Schema (`pgTable`, columns) | `docs/sql-schema-declaration` | `users`, `todos` tables per module |
| Indexes & constraints | `docs/indexes-constraints` | `unique(email)`, FK `user_id`, index on `user_id` |
| Select / partial select | `docs/select` | `findById`, `findIdentityById` (column subset) |
| Insert | `docs/insert` | `save` on users and todos |
| Update | `docs/update` | `update` on todos |
| Delete | `docs/delete` | `deleteForUser` |
| Filters & operators | `docs/operators` | `eq`, `and`, `or`, `lt`, cursor pagination |
| `sql` template | `docs/sql` | Health check, raw counts if needed |
| Transactions | `docs/transactions` | Future multi-step use cases (register + seed, etc.) |
| Camel ↔ snake casing | `docs/sql-schema-declaration` | `casing: 'snake_case'` on `drizzle()` — matches existing DB column names |

### 4.2 Migrations (use now)

| Feature | Doc slug | Use in this project |
|---------|----------|---------------------|
| Migration fundamentals | `docs/migrations` | Codebase-first, Option 3 (generate + migrate) |
| `drizzle.config.ts` | `docs/drizzle-config-file` | `dialect: 'postgresql'`, schema glob, `out: './drizzle'` |
| `drizzle-kit generate` | `docs/drizzle-kit-generate` | Create SQL from schema diff |
| `drizzle-kit migrate` | `docs/drizzle-kit-migrate` | Apply pending migrations; logs in `__drizzle_migrations` |
| `drizzle-kit push` | `docs/drizzle-kit-push` | **Dev only** — rapid prototyping, not for prod |
| Custom migrations | `docs/kit-custom-migrations` | Escape hatch for data backfills |

### 4.3 Optional (later)

| Feature | Doc slug | When |
|---------|----------|------|
| Relational queries v2 | `docs/relations-v2` | If you add joins / `with:` loading (requires drizzle v1 beta) |
| Relations schema | `docs/relations-schema-declaration` | Formal FK + soft relations for `db.query` API |
| Joins | `docs/joins` | Cross-table reads without RQB |
| Dynamic query building | `docs/dynamic-query-building` | Complex filter APIs |
| Views | `docs/views` | Reporting / read models |
| Row-level security | `docs/rls` | Multi-tenant Postgres policies |
| Read replicas | `docs/read-replicas` | Scale-out reads |
| Seed | `docs/seed-overview` | Dev/staging fixtures |
| drizzle-kit studio | `docs/drizzle-kit-studio` | Local DB browser |
| Zod / Valibot schema | `docs/zod` | Share validation with DTOs (optional) |

### 4.4 Not needed for current scope

- SQLite driver (replaced by PostgreSQL)
- `MikroOrmMiddleware` equivalent (Drizzle has no session-scoped EM)
- Mikro-style entity identity map / automatic change tracking
- Mikro snapshots (replaced by drizzle-kit `snapshot.json` per migration folder)

---

## 5. Architecture decisions

| Decision | Recommendation | Rationale |
|----------|----------------|-----------|
| Driver | `node-postgres` (`pg`) | Documented first-class support; inject existing `Pool` into NestJS |
| Schema location | Per module `infrastructure/schema/*.schema.ts` | Preserves module ownership; aggregate in `core/database/schema/index.ts` for drizzle-kit |
| Relations | **FK in schema only**, no `defineRelations` initially | Todos already use plain `userId`; matches current code; add RQB later if needed |
| UUID columns | `uuid().primaryKey().defaultRandom()` | Postgres-native; replaces app-side `randomUUID()` defaults |
| Timestamps | `timestamp({ withTimezone: true }).notNull().defaultNow()` | Proper Postgres timestamps vs SQLite `date` |
| Boolean | `boolean().notNull().default(false)` | Native PG boolean |
| Casing | `casing: 'snake_case'` on drizzle instance | TS `passwordHash` → DB `password_hash` without per-column aliases |
| Migrations in prod | Run on boot via `drizzle-orm/node-postgres/migrator` **or** `drizzle-kit migrate` in entrypoint | Mirrors current `DatabaseMigrationService`; pick one and document |
| E2E database | PostgreSQL via **Testcontainers** or docker-compose service | In-memory SQLite goes away; align E2E with prod dialect |
| Request-scoped DB | Global `Pool` + stateless queries | No middleware; use `db.transaction()` for atomic multi-write flows |

---

## Phase 0 — Prerequisites

- [ ] Agree on PostgreSQL version (16+ recommended)
- [ ] Decide E2E strategy: Testcontainers `postgres` image vs. compose profile
- [ ] Confirm migration approach: **generate + migrate** (versioned SQL in git), not `push` in prod
- [ ] If existing SQLite data must be preserved, plan a one-time export/import (likely N/A for greenfield)

---

## Phase 1 — Dependencies & PostgreSQL

### 1.1 Install packages

```bash
pnpm add drizzle-orm pg
pnpm add -D drizzle-kit @types/pg
```

### 1.2 Remove MikroORM (Phase 6 — do not remove until adapters are swapped)

Packages to uninstall later:

```
@mikro-orm/core @mikro-orm/decorators @mikro-orm/migrations
@mikro-orm/nestjs @mikro-orm/sqlite @mikro-orm/cli
```

### 1.3 Environment

Update `.env.example`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app
```

Update `src/core/config/env.validation.ts` — keep `DATABASE_URL` required in production; validate `postgresql://` prefix.

### 1.4 Docker Compose

Add a `postgres` service and point `api` at it:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/app

volumes:
  pgdata:
```

Remove SQLite volume (`./data`) when migration is complete.

### 1.5 `drizzle.config.ts` (project root)

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/core/database/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    table: '__drizzle_migrations',
    schema: 'public',
  },
});
```

### 1.6 `package.json` scripts

```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio"
}
```

Remove `migration:create`, `migration:up`, `migration:down`.

---

## Phase 2 — Schema (replace Mikro entities)

### 2.1 Auth module — `users.schema.ts`

```typescript
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type UserRow = typeof usersTable.$inferSelect;
export type NewUserRow = typeof usersTable.$inferInsert;
```

### 2.2 Todos module — `todos.schema.ts`

```typescript
import { pgTable, uuid, varchar, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { usersTable } from '../../../auth/infrastructure/schema/users.schema';

export const todosTable = pgTable(
  'todos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'restrict' }),
    title: varchar('title', { length: 255 }).notNull(),
    isCompleted: boolean('is_completed').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('todos_user_id_index').on(table.userId)],
);

export type TodoRow = typeof todosTable.$inferSelect;
export type NewTodoRow = typeof todosTable.$inferInsert;
```

> **Module boundary note:** `todos.schema.ts` imports `usersTable` only for FK definition. This is schema-level coupling (acceptable). Runtime cross-module access still goes through `AuthPublicApi` / ports — not direct table imports from application code.

### 2.3 Schema barrel — `src/core/database/schema/index.ts`

```typescript
export * from '../../../modules/auth/infrastructure/schema/users.schema';
export * from '../../../modules/todos/infrastructure/schema/todos.schema';
```

### 2.4 Update mappers

Point mappers at `UserRow` / `TodoRow` instead of `UserEntity` / `TodoEntity`. Mapping logic stays identical.

### 2.5 Delete Mikro entity files

Remove after repositories are migrated:

- `src/modules/auth/infrastructure/entities/user.entity.ts`
- `src/modules/todos/infrastructure/entities/todo.entity.ts`

---

## Phase 3 — Core database module

### 3.1 Drizzle provider

```typescript
// drizzle.provider.ts
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DRIZZLE_DB = Symbol('DRIZZLE_DB');
export type DrizzleDb = NodePgDatabase<typeof schema>;

export function createDrizzlePool(databaseUrl: string): Pool {
  return new Pool({ connectionString: databaseUrl });
}

export function createDrizzleDb(pool: Pool): DrizzleDb {
  return drizzle({ client: pool, schema, casing: 'snake_case' });
}
```

### 3.2 `database.module.ts` (target)

```typescript
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'PG_POOL',
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        createDrizzlePool(config.get('database.url')!),
    },
    {
      provide: DRIZZLE_DB,
      inject: ['PG_POOL'],
      useFactory: (pool: Pool) => createDrizzleDb(pool),
    },
    DrizzleMigrationService,
    DrizzleDatabaseHealthAdapter,
    { provide: DATABASE_HEALTH, useExisting: DrizzleDatabaseHealthAdapter },
  ],
  exports: [DRIZZLE_DB, DATABASE_HEALTH],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}
  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
```

### 3.3 Migration on boot

**Option A — programmatic (recommended for NestJS):**

```typescript
import { migrate } from 'drizzle-orm/node-postgres/migrator';

@Injectable()
export class DrizzleMigrationService implements OnModuleInit {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async onModuleInit(): Promise<void> {
    await migrate(this.db, { migrationsFolder: './drizzle' });
  }
}
```

**Option B — CLI in Docker entrypoint:** `pnpm db:migrate && node dist/main`

Ensure `drizzle/` SQL folder is copied into the production image.

### 3.4 Health adapter

```typescript
import { sql } from 'drizzle-orm';

async checkConnectivity(): Promise<boolean> {
  try {
    await this.db.execute(sql`select 1`);
    return true;
  } catch {
    return false;
  }
}
```

### 3.5 Remove `MikroOrmMiddleware`

In `core.module.ts`, drop `MikroOrmMiddleware` from middleware chain. Keep `RequestIdMiddleware` only.

---

## Phase 4 — Repository adapters

Rename implementations; **ports and application services stay unchanged**.

### 4.1 `DrizzleUserRepository`

| Port method | MikroORM today | Drizzle equivalent |
|-------------|----------------|-------------------|
| `findByEmail` | `em.findOne(UserEntity, { email })` | `db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1)` |
| `findById` | `em.findOne(UserEntity, { id })` | `eq(usersTable.id, id)` |
| `findIdentityById` | `findOne` with `fields: ['id','email']` | `.select({ id: usersTable.id, email: usersTable.email })` |
| `save` | `em.create` + `persist` + `flush` | `db.insert(usersTable).values({...}).returning()` |

### 4.2 `DrizzleTodoRepository`

| Port method | MikroORM today | Drizzle equivalent |
|-------------|----------------|-------------------|
| `save` | `create` + `persist` + `flush` | `insert(...).returning()` |
| `findPageByUserId` | `find` with `$or` / `$lt` cursor filter | `and(eq(userId), or(lt(createdAt), and(eq(createdAt), lt(id))))` + `orderBy(desc)` + `limit` |
| `findByIdForUser` | `findOne({ id, userId })` | `and(eq(...), eq(...))` |
| `update` | mutate entity + `flush` | `update(todosTable).set({...}).where(and(...)).returning()` |
| `deleteForUser` | `remove` + `flush` | `delete(...).where(and(...))` → check `rowCount` |
| `count` | `em.count(TodoEntity)` | `select({ count: sql\`count(*)\` }).from(todosTable)` |

**Cursor pagination example:**

```typescript
const rows = await this.db
  .select()
  .from(todosTable)
  .where(
  and(
    eq(todosTable.userId, query.userId),
    query.cursor
      ? or(
          lt(todosTable.createdAt, cursorRow.createdAt),
          and(
            eq(todosTable.createdAt, cursorRow.createdAt),
            lt(todosTable.id, cursorRow.id),
          ),
        )
      : undefined,
  ),
)
  .orderBy(desc(todosTable.createdAt), desc(todosTable.id))
  .limit(query.limit + 1);
```

### 4.3 Module registration

**Before (auth.module.ts):**

```typescript
MikroOrmModule.forFeature([UserEntity]),
{ provide: USER_REPOSITORY, useClass: MikroUserRepository },
```

**After:**

```typescript
{ provide: USER_REPOSITORY, useClass: DrizzleUserRepository },
```

No `forFeature` equivalent — repositories inject `DRIZZLE_DB` directly.

---

## Phase 5 — Migrations

### 5.1 Strategy

Use **Option 3** from Drizzle migrations docs: schema in TypeScript → `drizzle-kit generate` → versioned SQL in `drizzle/` → apply with migrator.

Do **not** use `drizzle-kit push` in production.

### 5.2 Initial migration

1. Add schemas (Phase 2)
2. `pnpm db:generate` — produces `drizzle/<timestamp>_*/migration.sql`
3. Review SQL — expect:

```sql
CREATE TABLE "users" (...);
CREATE UNIQUE INDEX ... ON "users" ("email");
CREATE TABLE "todos" (...);
ALTER TABLE "todos" ADD CONSTRAINT ... FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE restrict;
CREATE INDEX "todos_user_id_index" ON "todos" ("user_id");
```

4. `pnpm db:migrate` locally
5. Commit `drizzle/` folder to git

### 5.3 Delete Mikro artifacts

```
src/migrations/Migration*.ts
src/migrations/.snapshot-*.json
mikro-orm.config.ts
```

### 5.4 Ongoing workflow

```bash
# 1. Change schema TS files
# 2. Generate migration
pnpm db:generate
# 3. Review migration.sql
# 4. Apply locally
pnpm db:migrate
# 5. Commit schema + drizzle/ changes
```

---

## Phase 6 — Remove MikroORM

Execute only after all tests pass with Drizzle.

- [ ] Uninstall all `@mikro-orm/*` packages
- [ ] Delete Mikro config and migration files
- [ ] Remove `MikroOrmMiddleware` import from `core.module.ts`
- [ ] Update `.dependency-cruiser.cjs` rule `domain-no-orm` to forbid `drizzle-orm` in domain (replace `@mikro-orm` path)
- [ ] Update `docs/module-ownership.md`, module READMEs, root `README.md`
- [ ] Update Cursor rules if they still say "MikroORM"

---

## Phase 7 — Tests & CI

### 7.1 Unit tests

No change — they mock `USER_REPOSITORY` / `TODO_REPOSITORY` ports.

### 7.2 E2E tests

Replace in-memory SQLite:

```typescript
// Option: Testcontainers
import { PostgreSqlContainer } from '@testcontainers/postgresql';

process.env.DATABASE_URL = (await new PostgreSqlContainer('postgres:16').start()).getConnectionUri();
```

Or start compose `postgres` in CI before `pnpm test:e2e`.

Update `test/e2e/helpers/test-app.ts` accordingly.

### 7.3 CI pipeline

1. Service container: `postgres:16-alpine`
2. `DATABASE_URL=postgresql://...`
3. `pnpm build`
4. `pnpm db:migrate` (or rely on boot migration)
5. `pnpm test` + `pnpm test:e2e`

---

## File change checklist

| Action | Path |
|--------|------|
| **Add** | `drizzle.config.ts` |
| **Add** | `src/core/database/drizzle.provider.ts` |
| **Add** | `src/core/database/schema/index.ts` |
| **Add** | `src/modules/auth/infrastructure/schema/users.schema.ts` |
| **Add** | `src/modules/todos/infrastructure/schema/todos.schema.ts` |
| **Add** | `src/modules/auth/infrastructure/repositories/drizzle-user.repository.ts` |
| **Add** | `src/modules/todos/infrastructure/repositories/drizzle-todo.repository.ts` |
| **Add** | `src/core/database/adapters/drizzle-database-health.adapter.ts` |
| **Add** | `src/core/database/drizzle-migration.service.ts` |
| **Add** | `drizzle/<generated>/migration.sql` |
| **Modify** | `src/core/database/database.module.ts` |
| **Modify** | `src/core/core.module.ts` |
| **Modify** | `src/modules/auth/auth.module.ts` |
| **Modify** | `src/modules/todos/todos.module.ts` |
| **Modify** | `src/modules/*/infrastructure/mappers/*.mapper.ts` |
| **Modify** | `package.json`, `.env.example`, `docker-compose.yml` |
| **Modify** | `test/e2e/helpers/test-app.ts` |
| **Modify** | `.dependency-cruiser.cjs`, `docs/module-ownership.md` |
| **Delete** | All MikroORM files listed in [§1](#1-current-state) |

---

## MikroORM → Drizzle query cheat sheet

| Concept | MikroORM | Drizzle |
|---------|----------|---------|
| Config | `defineConfig({ entities, driver })` | `drizzle.config.ts` + `pgTable` schemas |
| Inject DB | `@InjectEntityManager()` / `EntityManager` | `@Inject(DRIZZLE_DB) db: DrizzleDb` |
| Find one | `em.findOne(Entity, where)` | `db.select().from(table).where(...).limit(1)` |
| Find many | `em.find(Entity, where, { orderBy, limit })` | `db.select().from(table).where(...).orderBy(...).limit(n)` |
| Create | `em.create(Entity, data)` + `persist` + `flush` | `db.insert(table).values(data).returning()` |
| Update | Mutate entity + `flush` | `db.update(table).set(data).where(...).returning()` |
| Delete | `em.remove(entity)` + `flush` | `db.delete(table).where(...)` |
| Count | `em.count(Entity, where)` | `sql\`count(*)\`` or `count()` helper |
| Transaction | `em.transactional(cb)` | `db.transaction(async (tx) => { ... })` |
| Raw SQL | `em.getConnection().execute('select 1')` | `db.execute(sql\`select 1\`)` |
| Migrations | `mikro-orm migration:create` | `drizzle-kit generate` + `migrate` |
| Request scope | `MikroOrmMiddleware` | Not needed |

---

## Risks & open questions

| Risk | Mitigation |
|------|------------|
| No official `@nestjs/drizzle` package | Thin custom provider (Phase 3) — well-established pattern |
| SQLite → PG type differences | Fresh PG schema; no data migration if acceptable |
| E2E slower with real Postgres | Testcontainers reuse / compose; parallel test DBs per worker |
| Cross-module schema import for FK | Document as schema-only exception; enforce via dependency-cruiser |
| `drizzle/` path in compiled `dist/` | Copy `drizzle/` in Dockerfile or use absolute path from `process.cwd()` |
| Relations v2 requires drizzle v1 beta | Stay on stable drizzle + SQL joins until beta is adopted project-wide |

**Open questions for team sign-off:**

1. Testcontainers vs. compose-only for E2E?
2. Run migrations on app boot vs. separate init container in K8s?
3. Keep `db:push` script for local dev convenience (document as dev-only)?
4. Adopt `defineRelations` + RQB now or defer?

---

## References

### Drizzle documentation (via drizzle-docs-mcp)

| Topic | Slug |
|-------|------|
| PostgreSQL setup | `docs/get-started-postgresql` |
| Schema declaration | `docs/sql-schema-declaration` |
| Indexes & constraints | `docs/indexes-constraints` |
| Migrations overview | `docs/migrations` |
| drizzle.config.ts | `docs/drizzle-config-file` |
| drizzle-kit generate | `docs/drizzle-kit-generate` |
| drizzle-kit migrate | `docs/drizzle-kit-migrate` |
| Select / Insert / Update / Delete | `docs/select`, `docs/insert`, `docs/update`, `docs/delete` |
| Operators | `docs/operators` |
| Transactions | `docs/transactions` |
| Relations v2 | `docs/relations-v2` |
| Kit overview | `docs/kit-overview` |

### Project docs

- [Module ownership](./module-ownership.md)
- [Scale path](./scale-path.md)

### Suggested implementation order

```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 7 → Phase 6
```

Phases 4 and 5 can overlap (implement repositories against a migrated local DB while generating the initial SQL). Phase 6 is strictly last.
