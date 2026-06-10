import { Inject, Injectable } from '@nestjs/common';
import {
  TODO_REPOSITORY,
  type TodoRepositoryPort,
} from '../application/ports/todo.repository.port';

/**
 * Public facade for cross-module access to todo operations.
 */
@Injectable()
export class TodosPublicApi {
  constructor(
    @Inject(TODO_REPOSITORY)
    private readonly todoRepository: TodoRepositoryPort,
  ) {}

  /**
   * Returns the total number of todos without exposing entities.
   */
  async countTodos(): Promise<number> {
    return this.todoRepository.count();
  }
}
