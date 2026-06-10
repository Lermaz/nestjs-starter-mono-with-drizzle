import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  TODO_CREATED_EVENT,
  TodoCreatedEvent,
} from '../../application/events/todo-created.event';

/**
 * Handles todo integration events for module-local side effects.
 */
@Injectable()
export class TodoCreatedListener {
  private readonly logger = new Logger(TodoCreatedListener.name);

  @OnEvent(TODO_CREATED_EVENT)
  handleTodoCreated(payload: TodoCreatedEvent): void {
    this.logger.log(`Todo created: ${payload.id} - ${payload.title}`);
  }
}
