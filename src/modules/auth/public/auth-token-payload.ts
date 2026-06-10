/**
 * JWT payload shape exposed for cross-module consumers.
 */
export interface AuthTokenPayload {
  readonly userId: string;
  readonly email: string;
}
