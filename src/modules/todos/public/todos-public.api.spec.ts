import { Test, TestingModule } from '@nestjs/testing';
import {
  TODO_REPOSITORY,
  TodoRepositoryPort,
} from '../application/ports/todo.repository.port';
import { TodosPublicApi } from './todos-public.api';

describe('TodosPublicApi', () => {
  let todosPublicApi: TodosPublicApi;
  let mockTodoRepository: jest.Mocked<TodoRepositoryPort>;

  beforeEach(async () => {
    mockTodoRepository = {
      save: jest.fn(),
      findPageByUserId: jest.fn(),
      findByIdForUser: jest.fn(),
      update: jest.fn(),
      deleteForUser: jest.fn(),
      count: jest.fn(),
    };
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        TodosPublicApi,
        {
          provide: TODO_REPOSITORY,
          useValue: mockTodoRepository,
        },
      ],
    }).compile();
    todosPublicApi = app.get<TodosPublicApi>(TodosPublicApi);
  });

  describe('countTodos', () => {
    it('should return the repository count', async () => {
      mockTodoRepository.count.mockResolvedValue(3);
      const actualCount = await todosPublicApi.countTodos();
      expect(actualCount).toBe(3);
      expect(mockTodoRepository.count.mock.calls).toHaveLength(1);
    });
  });
});
