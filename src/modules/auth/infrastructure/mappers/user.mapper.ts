import { CreateUserProps, User } from '../../domain/user.model';
import { UserRow } from '../schema/users.schema';

export interface NewUserPersistence {
  readonly email: string;
  readonly passwordHash: string;
  readonly createdAt: Date;
}

/**
 * Maps a persistence row to a domain user.
 */
export function toDomainUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    createdAt: row.createdAt,
  };
}

/**
 * Maps user credentials to a new persistence row shape.
 */
export function toNewUserEntity(props: CreateUserProps): NewUserPersistence {
  return {
    email: props.email,
    passwordHash: props.passwordHash,
    createdAt: new Date(),
  };
}
