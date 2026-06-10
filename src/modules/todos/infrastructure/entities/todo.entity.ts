import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';

/**
 * Persistence model for a todo item.
 */
@Entity({ tableName: 'todos' })
export class TodoEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @Property({ type: 'uuid' })
  userId!: string;

  @Property({ type: 'string', length: 255 })
  title!: string;

  @Property({ type: 'boolean' })
  isCompleted: boolean = false;

  @Property({ type: 'date' })
  createdAt: Date = new Date();
}
