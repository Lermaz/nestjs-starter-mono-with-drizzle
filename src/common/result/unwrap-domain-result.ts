import { DomainError } from '../errors/domain.error';
import type { Result } from './result';

/**
 * Returns the value or rethrows the domain error for HTTP mapping.
 */
export function unwrapDomainResult<T>(result: Result<T, DomainError>): T {
  if (!result.ok) {
    throw result.error;
  }
  return result.value;
}
