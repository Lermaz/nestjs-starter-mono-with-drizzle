import { TodoRow } from '../schema/todos.schema';
import { toDomainTodo } from './todo.mapper';

describe('todo.mapper', () => {
  describe('toDomainTodo', () => {
    it('should map row fields to domain todo', () => {
      const inputRow: TodoRow = {
        id: 'todo-1',
        userId: 'user-1',
        title: 'Test todo',
        isCompleted: true,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      };
      const actualTodo = toDomainTodo(inputRow);
      expect(actualTodo).toEqual({
        id: 'todo-1',
        title: 'Test todo',
        isCompleted: true,
        createdAt: inputRow.createdAt,
      });
    });
  });
});
