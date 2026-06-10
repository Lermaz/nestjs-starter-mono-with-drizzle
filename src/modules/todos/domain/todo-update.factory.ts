import { err, ok } from '../../../common/result/result.helpers';
import type { Result } from '../../../common/result/result';
import { DomainError } from './domain.error';
import { CreateTodoProps } from './todo.model';

const MAX_TITLE_LENGTH = 255;

/**
 * Properties allowed when updating a todo.
 */
export interface UpdateTodoProps {
  readonly title?: string;
  readonly isCompleted?: boolean;
}

/**
 * Validates partial todo update properties.
 */
export function validateUpdateTodoProps(
  props: UpdateTodoProps,
): Result<UpdateTodoProps, DomainError> {
  const hasTitle = props.title !== undefined;
  const hasCompletion = props.isCompleted !== undefined;
  if (!hasTitle && !hasCompletion) {
    return err(
      new DomainError('At least one field must be provided for update'),
    );
  }
  if (hasTitle) {
    const trimmedTitle = props.title.trim();
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
    return ok({
      title: trimmedTitle,
      isCompleted: props.isCompleted,
    });
  }
  return ok({ isCompleted: props.isCompleted });
}

/**
 * Merges update props onto existing todo values.
 */
export function mergeTodoUpdate(
  existing: CreateTodoProps,
  update: UpdateTodoProps,
): CreateTodoProps {
  return {
    title: update.title ?? existing.title,
    isCompleted: update.isCompleted ?? existing.isCompleted,
  };
}
