import { TodoEntity } from '../entities/todo.entity';
import { toDomainTodo } from './todo.mapper';

describe('todo.mapper', () => {
  describe('toDomainTodo', () => {
    it('should map entity fields to domain todo', () => {
      const inputEntity: TodoEntity = {
        id: 'todo-1',
        userId: 'user-1',
        title: 'Test todo',
        isCompleted: true,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      };
      const actualTodo = toDomainTodo(inputEntity);
      expect(actualTodo).toEqual({
        id: 'todo-1',
        title: 'Test todo',
        isCompleted: true,
        createdAt: inputEntity.createdAt,
      });
    });
  });
});
