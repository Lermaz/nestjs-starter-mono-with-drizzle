import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../../../core/database/drizzle.provider';
import type { DrizzleDb } from '../../../../core/database/drizzle.provider';
import { UserIdentity } from '../../domain/user-identity.model';
import { CreateUserProps, User } from '../../domain/user.model';
import { UserRepositoryPort } from '../../application/ports/user.repository.port';
import { toDomainUser, toNewUserEntity } from '../mappers/user.mapper';
import { usersTable } from '../schema/users.schema';

/**
 * Drizzle implementation of the user repository port.
 */
@Injectable()
export class DrizzleUserRepository implements UserRepositoryPort {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async findByEmail(email: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);
    if (!row) {
      return null;
    }
    return toDomainUser(row);
  }

  async findById(id: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    if (!row) {
      return null;
    }
    return toDomainUser(row);
  }

  async findIdentityById(id: string): Promise<UserIdentity | null> {
    const [row] = await this.db
      .select({ id: usersTable.id, email: usersTable.email })
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    if (!row) {
      return null;
    }
    return { id: row.id, email: row.email };
  }

  async save(props: CreateUserProps): Promise<User> {
    const [row] = await this.db
      .insert(usersTable)
      .values(toNewUserEntity(props))
      .returning();
    return toDomainUser(row);
  }
}
