# TodosModule

Owns todo persistence, CRUD API, and the `todos` table.

## Public API (cross-module)

Exported via `TodosModule.exports`:

| Symbol | Method | Description |
|--------|--------|-------------|
| `TodosPublicApi` | `countTodos(): Promise<number>` | Returns total todo count without exposing entities |

Import from: `src/modules/todos/public` (barrel)

## HTTP API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/todos/admin/test` | Public | Smoke test |
| `POST` | `/todos` | Bearer | Create todo (30/min rate limit) |
| `GET` | `/todos` | Bearer | List todos (`?cursor=&limit=`, default 20) |
| `GET` | `/todos/:id` | Bearer | Get todo by id (owner only) |
| `PATCH` | `/todos/:id` | Bearer | Update todo (30/min rate limit) |
| `DELETE` | `/todos/:id` | Bearer | Delete todo (30/min rate limit) |

## Private layers

- `domain/` — pure TS todo models and validation
- `application/` — `TodosService`, repository port, integration events
- `infrastructure/` — `TodoEntity`, MikroORM repository, mappers
- `presentation/` — controller, DTOs, response mappers
