export const TODO_CREATED_EVENT = 'todo.created' as const;

/**
 * Integration event emitted when a new todo is persisted.
 */
export class TodoCreatedEvent {
  constructor(
    public readonly id: string,
    public readonly title: string,
  ) {}
}
