import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Inject,
  Injectable,
} from '../../../common/nest/application.decorators';
import { DomainError } from '../../../common/errors/domain.error';
import { err, ok } from '../../../common/result/result.helpers';
import type { Result } from '../../../common/result/result';
import { createTodoProps } from '../domain/todo.factory';
import {
  mergeTodoUpdate,
  validateUpdateTodoProps,
} from '../domain/todo-update.factory';
import { Todo, TodoPage } from '../domain/todo.model';
import {
  TODO_CREATED_EVENT,
  TodoCreatedEvent,
} from './events/todo-created.event';
import { TODO_REPOSITORY } from './ports/todo.repository.port';
import type { TodoRepositoryPort } from './ports/todo.repository.port';

const DEFAULT_PAGE_LIMIT = 20;
const MAX_PAGE_LIMIT = 100;

/**
 * Application service for todo business operations.
 */
@Injectable()
export class TodosService {
  constructor(
    @Inject(TODO_REPOSITORY)
    private readonly todoRepository: TodoRepositoryPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Creates a new todo from the given input.
   */
  async createTodo(
    userId: string,
    title: string,
    isCompleted = false,
  ): Promise<Result<Todo, DomainError>> {
    const propsResult = createTodoProps(title, isCompleted);
    if (!propsResult.ok) {
      return propsResult;
    }
    const todo = await this.todoRepository.save({
      userId,
      props: propsResult.value,
    });
    this.eventEmitter.emit(
      TODO_CREATED_EVENT,
      new TodoCreatedEvent(todo.id, todo.title),
    );
    return ok(todo);
  }

  /**
   * Returns a paginated list of todos for a user.
   */
  async findTodosPage(
    userId: string,
    limit = DEFAULT_PAGE_LIMIT,
    cursor?: string,
  ): Promise<TodoPage> {
    const normalizedLimit = Math.min(Math.max(limit, 1), MAX_PAGE_LIMIT);
    return this.todoRepository.findPageByUserId({
      userId,
      limit: normalizedLimit,
      cursor,
    });
  }

  /**
   * Returns a single todo by id for the given user.
   */
  async findTodoById(
    userId: string,
    id: string,
  ): Promise<Result<Todo, DomainError>> {
    const todo = await this.todoRepository.findByIdForUser(userId, id);
    if (!todo) {
      return err(new DomainError(`Todo with id "${id}" not found`, 404));
    }
    return ok(todo);
  }

  /**
   * Updates a todo for the given user.
   */
  async updateTodo(
    userId: string,
    id: string,
    title?: string,
    isCompleted?: boolean,
  ): Promise<Result<Todo, DomainError>> {
    const existingTodo = await this.todoRepository.findByIdForUser(userId, id);
    if (!existingTodo) {
      return err(new DomainError(`Todo with id "${id}" not found`, 404));
    }
    const updateResult = validateUpdateTodoProps({ title, isCompleted });
    if (!updateResult.ok) {
      return updateResult;
    }
    const mergedProps = mergeTodoUpdate(
      {
        title: existingTodo.title,
        isCompleted: existingTodo.isCompleted,
      },
      updateResult.value,
    );
    const updatedTodo = await this.todoRepository.update({
      userId,
      todoId: id,
      title: mergedProps.title,
      isCompleted: mergedProps.isCompleted,
    });
    if (!updatedTodo) {
      return err(new DomainError(`Todo with id "${id}" not found`, 404));
    }
    return ok(updatedTodo);
  }

  /**
   * Deletes a todo for the given user.
   */
  async deleteTodo(
    userId: string,
    id: string,
  ): Promise<Result<void, DomainError>> {
    const isDeleted = await this.todoRepository.deleteForUser(userId, id);
    if (!isDeleted) {
      return err(new DomainError(`Todo with id "${id}" not found`, 404));
    }
    return ok(undefined);
  }

  /**
   * Returns a smoke test response for the todos module.
   */
  getTestResponse(): { status: string } {
    return { status: 'ok' };
  }
}
