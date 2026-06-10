import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { TODO_REPOSITORY } from './application/ports/todo.repository.port';
import { TodosService } from './application/todos.service';
import { TodoCreatedListener } from './infrastructure/listeners/todo-created.listener';
import { DrizzleTodoRepository } from './infrastructure/repositories/drizzle-todo.repository';
import { TodosPublicApi } from './public/todos-public.api';
import { TodosController } from './presentation/todos.controller';

/**
 * Todos feature module with CRUD endpoints and repository pattern.
 */
@Module({
  imports: [CommonModule],
  controllers: [TodosController],
  providers: [
    TodosService,
    TodosPublicApi,
    TodoCreatedListener,
    {
      provide: TODO_REPOSITORY,
      useClass: DrizzleTodoRepository,
    },
  ],
  exports: [TodosPublicApi],
})
export class TodosModule {}
