import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { DomainError } from '../../common/errors/domain.error';
import { ok } from '../../common/result/result.helpers';
import { Todo } from './domain/todo.model';
import {
  TODO_REPOSITORY,
  TodoRepositoryPort,
} from './application/ports/todo.repository.port';
import { TODO_CREATED_EVENT } from './application/events/todo-created.event';
import { TodosService } from './application/todos.service';

describe('TodosService', () => {
  let todosService: TodosService;
  let mockTodoRepository: jest.Mocked<TodoRepositoryPort>;
  let mockEventEmitter: jest.Mocked<Pick<EventEmitter2, 'emit'>>;

  const inputTodo: Todo = {
    id: 'todo-1',
    title: 'Test todo',
    isCompleted: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    mockTodoRepository = {
      save: jest.fn(),
      findPageByUserId: jest.fn(),
      findByIdForUser: jest.fn(),
      update: jest.fn(),
      deleteForUser: jest.fn(),
      count: jest.fn(),
    };
    mockEventEmitter = {
      emit: jest.fn(),
    };
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: TODO_REPOSITORY,
          useValue: mockTodoRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();
    todosService = app.get<TodosService>(TodosService);
  });

  describe('createTodo', () => {
    it('should create a todo and emit integration event', async () => {
      mockTodoRepository.save.mockResolvedValue(inputTodo);
      const actualResult = await todosService.createTodo('user-1', 'Test todo');
      expect(actualResult.ok).toBe(true);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        TODO_CREATED_EVENT,
        expect.objectContaining({ id: inputTodo.id, title: inputTodo.title }),
      );
    });
  });

  describe('findTodosPage', () => {
    it('should return paginated todos from repository', async () => {
      mockTodoRepository.findPageByUserId.mockResolvedValue({
        items: [inputTodo],
        nextCursor: null,
      });
      const actualResult = await todosService.findTodosPage('user-1', 10);
      expect(actualResult.items).toHaveLength(1);
    });
  });

  describe('updateTodo', () => {
    it('should update an existing todo', async () => {
      mockTodoRepository.findByIdForUser.mockResolvedValue(inputTodo);
      mockTodoRepository.update.mockResolvedValue({
        ...inputTodo,
        title: 'Updated',
      });
      const actualResult = await todosService.updateTodo(
        'user-1',
        'todo-1',
        'Updated',
      );
      expect(actualResult.ok).toBe(true);
    });

    it('should return DomainError when todo is missing', async () => {
      mockTodoRepository.findByIdForUser.mockResolvedValue(null);
      const actualResult = await todosService.updateTodo(
        'user-1',
        'missing',
        'Updated',
      );
      expect(actualResult.ok).toBe(false);
    });
  });

  describe('deleteTodo', () => {
    it('should delete an existing todo', async () => {
      mockTodoRepository.deleteForUser.mockResolvedValue(true);
      const actualResult = await todosService.deleteTodo('user-1', 'todo-1');
      expect(actualResult.ok).toBe(true);
    });

    it('should return DomainError when todo is missing', async () => {
      mockTodoRepository.deleteForUser.mockResolvedValue(false);
      const actualResult = await todosService.deleteTodo('user-1', 'missing');
      expect(actualResult.ok).toBe(false);
      if (!actualResult.ok) {
        expect(actualResult.error).toBeInstanceOf(DomainError);
      }
    });
  });

  describe('findTodoById', () => {
    it('should return a todo when found', async () => {
      mockTodoRepository.findByIdForUser.mockResolvedValue(inputTodo);
      const actualResult = await todosService.findTodoById('user-1', 'todo-1');
      expect(actualResult).toEqual(ok(inputTodo));
    });
  });
});
