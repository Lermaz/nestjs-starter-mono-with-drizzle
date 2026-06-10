import { registerAs } from '@nestjs/config';

const DEFAULT_DATABASE_URL = 'sqlite://./data/app.db';

export interface DatabaseConfig {
  readonly url: string;
}

/**
 * Database configuration loaded from environment variables.
 */
export const databaseConfig = registerAs(
  'database',
  (): DatabaseConfig => ({
    url: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
  }),
);
