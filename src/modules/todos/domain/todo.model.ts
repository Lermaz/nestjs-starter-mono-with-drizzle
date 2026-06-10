/**
 * Domain model for a todo item.
 */
export interface Todo {
  readonly id: string;
  readonly title: string;
  readonly isCompleted: boolean;
  readonly createdAt: Date;
}

/**
 * Properties required to create a new todo.
 */
export interface CreateTodoProps {
  readonly title: string;
  readonly isCompleted: boolean;
}

/**
 * Command for persisting a new todo for a user.
 */
export interface SaveTodoCommand {
  readonly userId: string;
  readonly props: CreateTodoProps;
}

/**
 * Paginated todo list for a user.
 */
export interface TodoPage {
  readonly items: readonly Todo[];
  readonly nextCursor: string | null;
}

/**
 * Query for cursor-based todo pagination.
 */
export interface FindTodosPageQuery {
  readonly userId: string;
  readonly limit: number;
  readonly cursor?: string;
}

/**
 * Command for updating an existing todo.
 */
export interface UpdateTodoCommand {
  readonly userId: string;
  readonly todoId: string;
  readonly title?: string;
  readonly isCompleted?: boolean;
}
