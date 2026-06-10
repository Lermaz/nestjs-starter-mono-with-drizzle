import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';

/**
 * Persistence model for an authenticated user.
 */
@Entity({ tableName: 'users' })
export class UserEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @Property({ type: 'string', length: 255, unique: true })
  email!: string;

  @Property({ type: 'string', length: 255 })
  passwordHash!: string;

  @Property({ type: 'date' })
  createdAt: Date = new Date();
}
