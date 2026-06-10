import { TodoPage } from '../../domain/todo.model';
import { TodoPageResponseDto } from '../dto/todo-page-response.dto';
import { toTodoResponseDto } from './todo-response.mapper';

/**
 * Maps a domain todo page to an API response DTO.
 */
export function toTodoPageResponseDto(page: TodoPage): TodoPageResponseDto {
  return {
    items: page.items.map((todo) => toTodoResponseDto(todo)),
    nextCursor: page.nextCursor,
  };
}
