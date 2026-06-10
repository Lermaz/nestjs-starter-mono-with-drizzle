import { err, ok } from '../../../common/result/result.helpers';
import type { Result } from '../../../common/result/result';
import { DomainError } from './domain.error';
import { User } from './user.model';

export const INVALID_CREDENTIALS_MESSAGE = 'Invalid credentials';
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

/**
 * Ensures a password meets registration policy.
 */
export function assertPasswordMeetsPolicy(
  password: string,
): Result<void, DomainError> {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return err(
      new DomainError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      ),
    );
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return err(
      new DomainError(
        `Password must be at most ${MAX_PASSWORD_LENGTH} characters`,
      ),
    );
  }
  return ok(undefined);
}

/**
 * Ensures an email is available for registration.
 */
export function assertEmailAvailable(
  existingUser: User | null,
): Result<void, DomainError> {
  if (existingUser) {
    return err(new DomainError(INVALID_CREDENTIALS_MESSAGE, 401));
  }
  return ok(undefined);
}
