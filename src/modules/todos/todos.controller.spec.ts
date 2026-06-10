import { Test, TestingModule } from '@nestjs/testing';
import { NonProductionGuard } from '../../common/guards/non-production.guard';
import { ok } from '../../common/result/result.helpers';
import type { AuthTokenPayload } from '../auth/public';
import { Todo } from './domain/todo.model';
import { TodosService } from './application/todos.service';
import { TodosController } from './presentation/todos.controller';

describe('TodosController', () => {
  let todosController: TodosController;
  let mockTodosService: jest.Mocked<
    Pick<
      TodosService,
      | 'createTodo'
      | 'findTodosPage'
      | 'findTodoById'
      | 'updateTodo'
      | 'deleteTodo'
      | 'getTestResponse'
    >
  >;

  const inputUser: AuthTokenPayload = {
    userId: 'user-1',
    email: 'user@example.com',
  };

  const expectedTodo: Todo = {
    id: 'todo-1',
    title: 'Test todo',
    isCompleted: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    mockTodosService = {
      createTodo: jest.fn(),
      findTodosPage: jest.fn(),
      findTodoById: jest.fn(),
      updateTodo: jest.fn(),
      deleteTodo: jest.fn(),
      getTestResponse: jest.fn(),
    };
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TodosController],
      providers: [
        {
          provide: TodosService,
          useValue: mockTodosService,
        },
      ],
    })
      .overrideGuard(NonProductionGuard)
      .useValue({ canActivate: (): boolean => true })
      .compile();
    todosController = app.get<TodosController>(TodosController);
  });

  describe('findTodosPage', () => {
    it('should delegate to service and map paginated response', async () => {
      mockTodosService.findTodosPage.mockResolvedValue({
        items: [expectedTodo],
        nextCursor: null,
      });
      const actualResult = await todosController.findTodosPage(inputUser, {});
      expect(actualResult.items).toHaveLength(1);
      expect(actualResult.nextCursor).toBeNull();
    });
  });

  describe('updateTodo', () => {
    it('should delegate to service and map response', async () => {
      mockTodosService.updateTodo.mockResolvedValue(ok(expectedTodo));
      const actualResult = await todosController.updateTodo(
        inputUser,
        'todo-1',
        { title: 'Updated' },
      );
      expect(actualResult.title).toBe('Test todo');
    });
  });

  describe('deleteTodo', () => {
    it('should delegate to service', async () => {
      mockTodosService.deleteTodo.mockResolvedValue(ok(undefined));
      await todosController.deleteTodo(inputUser, 'todo-1');
      expect(mockTodosService.deleteTodo).toHaveBeenCalledWith(
        'user-1',
        'todo-1',
      );
    });
  });
});
