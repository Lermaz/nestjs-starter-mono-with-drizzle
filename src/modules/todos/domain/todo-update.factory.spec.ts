import { DomainError } from './domain.error';
import { validateUpdateTodoProps } from './todo-update.factory';

describe('validateUpdateTodoProps', () => {
  it('should pass when title is provided', () => {
    const actualResult = validateUpdateTodoProps({ title: '  Updated  ' });
    expect(actualResult.ok).toBe(true);
    if (actualResult.ok) {
      expect(actualResult.value.title).toBe('Updated');
    }
  });

  it('should pass when only isCompleted is provided', () => {
    const actualResult = validateUpdateTodoProps({ isCompleted: true });
    expect(actualResult.ok).toBe(true);
  });

  it('should fail when no fields are provided', () => {
    const actualResult = validateUpdateTodoProps({});
    expect(actualResult.ok).toBe(false);
    if (!actualResult.ok) {
      expect(actualResult.error).toBeInstanceOf(DomainError);
    }
  });
});
