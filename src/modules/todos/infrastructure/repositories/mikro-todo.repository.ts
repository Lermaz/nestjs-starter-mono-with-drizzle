import { EntityManager, FilterQuery } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import {
  FindTodosPageQuery,
  SaveTodoCommand,
  Todo,
  TodoPage,
  UpdateTodoCommand,
} from '../../domain/todo.model';
import { TodoRepositoryPort } from '../../application/ports/todo.repository.port';
import { TodoEntity } from '../entities/todo.entity';
import { toDomainTodo, toNewTodoEntity } from '../mappers/todo.mapper';

const PAGINATION_OVERFETCH = 1;

/**
 * MikroORM implementation of the todo repository port.
 */
@Injectable()
export class MikroTodoRepository implements TodoRepositoryPort {
  constructor(private readonly entityManager: EntityManager) {}

  async save(command: SaveTodoCommand): Promise<Todo> {
    const entity = this.entityManager.create(
      TodoEntity,
      toNewTodoEntity(command.userId, command.props),
    );
    await this.entityManager.persist(entity).flush();
    return toDomainTodo(entity);
  }

  async findPageByUserId(query: FindTodosPageQuery): Promise<TodoPage> {
    const where = await this.buildPaginationFilter(query);
    const entities = await this.entityManager.find(TodoEntity, where, {
      orderBy: { createdAt: 'desc', id: 'desc' },
      limit: query.limit + PAGINATION_OVERFETCH,
    });
    const hasMore = entities.length > query.limit;
    const pageEntities = hasMore ? entities.slice(0, query.limit) : entities;
    const items = pageEntities.map((entity) => toDomainTodo(entity));
    const lastItem = items.at(-1);
    const nextCursor = hasMore && lastItem ? lastItem.id : null;
    return { items, nextCursor };
  }

  async findByIdForUser(userId: string, id: string): Promise<Todo | null> {
    const entity = await this.entityManager.findOne(TodoEntity, { id, userId });
    if (!entity) {
      return null;
    }
    return toDomainTodo(entity);
  }

  async update(command: UpdateTodoCommand): Promise<Todo | null> {
    const entity = await this.entityManager.findOne(TodoEntity, {
      id: command.todoId,
      userId: command.userId,
    });
    if (!entity) {
      return null;
    }
    if (command.title !== undefined) {
      entity.title = command.title;
    }
    if (command.isCompleted !== undefined) {
      entity.isCompleted = command.isCompleted;
    }
    await this.entityManager.flush();
    return toDomainTodo(entity);
  }

  async deleteForUser(userId: string, id: string): Promise<boolean> {
    const entity = await this.entityManager.findOne(TodoEntity, { id, userId });
    if (!entity) {
      return false;
    }
    await this.entityManager.remove(entity).flush();
    return true;
  }

  async count(): Promise<number> {
    return this.entityManager.count(TodoEntity, {});
  }

  private async buildPaginationFilter(
    query: FindTodosPageQuery,
  ): Promise<FilterQuery<TodoEntity>> {
    const baseFilter: FilterQuery<TodoEntity> = { userId: query.userId };
    if (!query.cursor) {
      return baseFilter;
    }
    const cursorEntity = await this.entityManager.findOne(TodoEntity, {
      id: query.cursor,
      userId: query.userId,
    });
    if (!cursorEntity) {
      return baseFilter;
    }
    return {
      userId: query.userId,
      $or: [
        { createdAt: { $lt: cursorEntity.createdAt } },
        {
          createdAt: cursorEntity.createdAt,
          id: { $lt: cursorEntity.id },
        },
      ],
    };
  }
}
