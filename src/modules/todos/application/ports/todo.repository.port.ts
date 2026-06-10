import {
  FindTodosPageQuery,
  SaveTodoCommand,
  Todo,
  TodoPage,
  UpdateTodoCommand,
} from '../../domain/todo.model';

/**
 * Contract for todo persistence operations.
 */
export interface TodoRepositoryPort {
  save(command: SaveTodoCommand): Promise<Todo>;
  findPageByUserId(query: FindTodosPageQuery): Promise<TodoPage>;
  findByIdForUser(userId: string, id: string): Promise<Todo | null>;
  update(command: UpdateTodoCommand): Promise<Todo | null>;
  deleteForUser(userId: string, id: string): Promise<boolean>;
  count(): Promise<number>;
}

export const TODO_REPOSITORY = Symbol('TODO_REPOSITORY');
