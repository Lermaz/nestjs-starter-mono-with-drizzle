import type { Result } from './result';

/**
 * Wraps a successful value in a Result.
 */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/**
 * Wraps a failure value in a Result.
 */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
