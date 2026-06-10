import { Todo } from '../../domain/todo.model';
import { TodoResponseDto } from '../dto/todo-response.dto';

/**
 * Maps a domain todo to an API response DTO.
 */
export function toTodoResponseDto(todo: Todo): TodoResponseDto {
  return {
    id: todo.id,
    title: todo.title,
    isCompleted: todo.isCompleted,
    createdAt: todo.createdAt,
  };
}
