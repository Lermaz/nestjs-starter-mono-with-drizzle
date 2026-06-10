import { DomainError } from './domain.error';
import { createTodoProps } from './todo.factory';

describe('createTodoProps', () => {
  it('should return trimmed title and completion flag', () => {
    const actualResult = createTodoProps('  Buy groceries  ', true);
    expect(actualResult.ok).toBe(true);
    if (actualResult.ok) {
      expect(actualResult.value).toEqual({
        title: 'Buy groceries',
        isCompleted: true,
      });
    }
  });

  it('should default isCompleted to false', () => {
    const actualResult = createTodoProps('Task');
    expect(actualResult.ok).toBe(true);
    if (actualResult.ok) {
      expect(actualResult.value.isCompleted).toBe(false);
    }
  });

  it('should fail when title is empty', () => {
    const actualResult = createTodoProps('   ');
    expect(actualResult.ok).toBe(false);
    if (!actualResult.ok) {
      expect(actualResult.error).toBeInstanceOf(DomainError);
    }
  });

  it('should fail when title exceeds max length', () => {
    const longTitle = 'a'.repeat(256);
    const actualResult = createTodoProps(longTitle);
    expect(actualResult.ok).toBe(false);
    if (!actualResult.ok) {
      expect(actualResult.error).toBeInstanceOf(DomainError);
    }
  });
});
