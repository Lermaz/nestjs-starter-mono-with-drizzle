import { CreateTodoProps, Todo } from '../../domain/todo.model';
import { TodoRow } from '../schema/todos.schema';

export interface NewTodoPersistence {
  readonly userId: string;
  readonly title: string;
  readonly isCompleted: boolean;
  readonly createdAt: Date;
}

/**
 * Maps a persistence row to a domain todo.
 */
export function toDomainTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    isCompleted: row.isCompleted,
    createdAt: row.createdAt,
  };
}

/**
 * Maps domain todo properties to a new persistence row shape.
 */
export function toNewTodoEntity(
  userId: string,
  props: CreateTodoProps,
): NewTodoPersistence {
  return {
    userId,
    title: props.title,
    isCompleted: props.isCompleted,
    createdAt: new Date(),
  };
}
