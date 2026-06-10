import { randomUUID } from 'node:crypto';

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Returns a trusted request ID from the header or generates a new UUID.
 */
export function resolveRequestId(headerValue: string | undefined): string {
  const trimmedValue = headerValue?.trim();
  if (trimmedValue && UUID_V4_PATTERN.test(trimmedValue)) {
    return trimmedValue;
  }
  return randomUUID();
}
