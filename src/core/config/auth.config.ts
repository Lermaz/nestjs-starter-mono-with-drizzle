import { registerAs } from '@nestjs/config';

const DEFAULT_BCRYPT_ROUNDS = 10;
const DEFAULT_JWT_EXPIRES_IN = '1d';

export interface AuthConfig {
  readonly jwtSecret: string;
  readonly jwtExpiresIn: string;
  readonly bcryptRounds: number;
}

/**
 * Authentication configuration loaded from environment variables.
 */
export const authConfig = registerAs(
  'auth',
  (): AuthConfig => ({
    jwtSecret: process.env.JWT_SECRET ?? 'change-me-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? DEFAULT_JWT_EXPIRES_IN,
    bcryptRounds: parseInt(
      process.env.BCRYPT_ROUNDS ?? String(DEFAULT_BCRYPT_ROUNDS),
      10,
    ),
  }),
);
