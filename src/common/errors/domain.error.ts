/**
 * Base error for domain invariant violations.
 */
export class DomainError extends Error {
  constructor(
    message: string,
    readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
