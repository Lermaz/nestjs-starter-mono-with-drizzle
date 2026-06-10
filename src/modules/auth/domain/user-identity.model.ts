/**
 * Minimal user identity for authentication checks without sensitive fields.
 */
export interface UserIdentity {
  readonly id: string;
  readonly email: string;
}
