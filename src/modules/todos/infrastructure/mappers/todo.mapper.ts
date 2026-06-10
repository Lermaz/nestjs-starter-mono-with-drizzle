import { CreateTodoProps, Todo } from '../../domain/todo.model';
import { TodoEntity } from '../entities/todo.entity';

/**
 * Maps a persistence entity to a domain todo.
 */
export function toDomainTodo(entity: TodoEntity): Todo {
  return {
    id: entity.id,
    title: entity.title,
    isCompleted: entity.isCompleted,
    createdAt: entity.createdAt,
  };
}

/**
 * Maps domain todo properties to a new persistence entity shape.
 */
export function toNewTodoEntity(
  userId: string,
  props: CreateTodoProps,
): Pick<TodoEntity, 'userId' | 'title' | 'isCompleted' | 'createdAt'> {
  return {
    userId,
    title: props.title,
    isCompleted: props.isCompleted,
    createdAt: new Date(),
  };
}
