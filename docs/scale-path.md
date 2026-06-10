# Scale Path

Decision guide for evolving beyond the current modular monolith. Each item stays **deferred** until its trigger is met.

## Triggers and actions

| Trigger | Action | Status |
|---------|--------|--------|
| 2+ deployables | Split into monorepo: `apps/api`, `libs/common`, `libs/domain-events` | 📋 documented |
| Async side effects grow | Outbox pattern or message bus for reliable events | 📋 documented |
| Read-heavy endpoints | CQRS read models separate from write path | 📋 documented |
| Team > 5 modules | Module-level CODEOWNERS + per-module arch tests | ✅ CODEOWNERS added |

## Monorepo (2+ deployables)

**When:** You ship a second deployable (worker, BFF, admin API).

**Approach:**

```
apps/
  api/          ← current NestJS app
  worker/       ← future background processor
libs/
  common/       ← Result, DomainError, decorators
  domain-events/← shared integration event contracts
```

**Migration steps:**

1. Introduce pnpm workspaces + Turborepo/Nx
2. Move `src/common` → `libs/common`
3. Keep feature modules in `apps/api` until a second app needs shared types
4. Point CI at workspace-aware build/test

## Outbox / message bus

**When:** In-process `EventEmitter2` side effects need durability or cross-service delivery.

**Approach:**

1. Add `outbox` table in owning module's infrastructure
2. Write domain events to outbox in same transaction as aggregate save
3. Background publisher reads outbox and pushes to bus (SQS, RabbitMQ, etc.)
4. Replace `TodoCreatedListener` in-process handler with consumer

## CQRS read models

**When:** List/query endpoints dominate latency or need complex projections.

**Approach:**

1. Introduce `@nestjs/cqrs` only on hot modules
2. Keep write path (commands) in current services
3. Add read models fed by integration events or projections
4. Do **not** add CQRS to Auth/Todos until metrics justify it

## Module ownership at scale

`.github/CODEOWNERS` maps paths to reviewers. Extend as new modules are added:

```
/src/modules/<module>/  @team-or-user
```

Run `pnpm arch:check` in CI for every PR. Add per-module arch tests when module count exceeds ~5.
