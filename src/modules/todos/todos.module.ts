import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { TODO_REPOSITORY } from './application/ports/todo.repository.port';
import { TodosService } from './application/todos.service';
import { TodoEntity } from './infrastructure/entities/todo.entity';
import { TodoCreatedListener } from './infrastructure/listeners/todo-created.listener';
import { MikroTodoRepository } from './infrastructure/repositories/mikro-todo.repository';
import { TodosPublicApi } from './public/todos-public.api';
import { TodosController } from './presentation/todos.controller';

/**
 * Todos feature module with CRUD endpoints and repository pattern.
 */
@Module({
  imports: [CommonModule, MikroOrmModule.forFeature([TodoEntity])],
  controllers: [TodosController],
  providers: [
    TodosService,
    TodosPublicApi,
    TodoCreatedListener,
    {
      provide: TODO_REPOSITORY,
      useClass: MikroTodoRepository,
    },
  ],
  exports: [TodosPublicApi],
})
export class TodosModule {}
