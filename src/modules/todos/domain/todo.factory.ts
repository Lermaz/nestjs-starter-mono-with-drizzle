import { err, ok } from '../../../common/result/result.helpers';
import type { Result } from '../../../common/result/result';
import { DomainError } from './domain.error';
import { CreateTodoProps } from './todo.model';

const MAX_TITLE_LENGTH = 255;

/**
 * Validates and returns properties for a new todo.
 */
export function createTodoProps(
  title: string,
  isCompleted = false,
): Result<CreateTodoProps, DomainError> {
  const trimmedTitle = title.trim();
  if (trimmedTitle.length === 0) {
    return err(new DomainError('Todo title cannot be empty'));
  }
  if (trimmedTitle.length > MAX_TITLE_LENGTH) {
    return err(
      new DomainError(
        `Todo title cannot exceed ${MAX_TITLE_LENGTH} characters`,
      ),
    );
  }
  return ok({ title: trimmedTitle, isCompleted });
}
