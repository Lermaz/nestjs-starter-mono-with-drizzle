import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, lt, or, SQL } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../../../core/database/drizzle.provider';
import type { DrizzleDb } from '../../../../core/database/drizzle.provider';
import {
  FindTodosPageQuery,
  SaveTodoCommand,
  Todo,
  TodoPage,
  UpdateTodoCommand,
} from '../../domain/todo.model';
import { TodoRepositoryPort } from '../../application/ports/todo.repository.port';
import { toDomainTodo, toNewTodoEntity } from '../mappers/todo.mapper';
import { TodoRow, todosTable } from '../schema/todos.schema';

const PAGINATION_OVERFETCH = 1;

/**
 * Drizzle implementation of the todo repository port.
 */
@Injectable()
export class DrizzleTodoRepository implements TodoRepositoryPort {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async save(command: SaveTodoCommand): Promise<Todo> {
    const [row] = await this.db
      .insert(todosTable)
      .values(toNewTodoEntity(command.userId, command.props))
      .returning();
    return toDomainTodo(row);
  }

  async findPageByUserId(query: FindTodosPageQuery): Promise<TodoPage> {
    const whereClause = await this.buildPaginationFilter(query);
    const rows = await this.db
      .select()
      .from(todosTable)
      .where(whereClause)
      .orderBy(desc(todosTable.createdAt), desc(todosTable.id))
      .limit(query.limit + PAGINATION_OVERFETCH);
    const hasMore = rows.length > query.limit;
    const pageRows = hasMore ? rows.slice(0, query.limit) : rows;
    const items = pageRows.map((row) => toDomainTodo(row));
    const lastItem = items.at(-1);
    const nextCursor = hasMore && lastItem ? lastItem.id : null;
    return { items, nextCursor };
  }

  async findByIdForUser(userId: string, id: string): Promise<Todo | null> {
    const [row] = await this.db
      .select()
      .from(todosTable)
      .where(and(eq(todosTable.id, id), eq(todosTable.userId, userId)))
      .limit(1);
    if (!row) {
      return null;
    }
    return toDomainTodo(row);
  }

  async update(command: UpdateTodoCommand): Promise<Todo | null> {
    const updates: Partial<Pick<TodoRow, 'title' | 'isCompleted'>> = {};
    if (command.title !== undefined) {
      updates.title = command.title;
    }
    if (command.isCompleted !== undefined) {
      updates.isCompleted = command.isCompleted;
    }
    const [row] = await this.db
      .update(todosTable)
      .set(updates)
      .where(
        and(
          eq(todosTable.id, command.todoId),
          eq(todosTable.userId, command.userId),
        ),
      )
      .returning();
    if (!row) {
      return null;
    }
    return toDomainTodo(row);
  }

  async deleteForUser(userId: string, id: string): Promise<boolean> {
    const deletedRows = await this.db
      .delete(todosTable)
      .where(and(eq(todosTable.id, id), eq(todosTable.userId, userId)))
      .returning({ id: todosTable.id });
    return deletedRows.length > 0;
  }

  async count(): Promise<number> {
    const [row] = await this.db.select({ value: count() }).from(todosTable);
    return row?.value ?? 0;
  }

  private async buildPaginationFilter(
    query: FindTodosPageQuery,
  ): Promise<SQL | undefined> {
    const userFilter = eq(todosTable.userId, query.userId);
    if (!query.cursor) {
      return userFilter;
    }
    const [cursorRow] = await this.db
      .select()
      .from(todosTable)
      .where(
        and(
          eq(todosTable.id, query.cursor),
          eq(todosTable.userId, query.userId),
        ),
      )
      .limit(1);
    if (!cursorRow) {
      return userFilter;
    }
    return and(userFilter, this.buildCursorFilter(cursorRow));
  }

  private buildCursorFilter(cursorRow: TodoRow): SQL {
    const cursorCondition = or(
      lt(todosTable.createdAt, cursorRow.createdAt),
      and(
        eq(todosTable.createdAt, cursorRow.createdAt),
        lt(todosTable.id, cursorRow.id),
      ),
    );
    if (!cursorCondition) {
      return eq(todosTable.userId, cursorRow.userId);
    }
    return cursorCondition;
  }
}
