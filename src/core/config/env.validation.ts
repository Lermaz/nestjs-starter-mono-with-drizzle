const DEFAULT_JWT_SECRET = 'change-me-in-production';
const PRODUCTION_NODE_ENV = 'production';
const SQLITE_URL_PREFIX = 'sqlite://';
const POSTGRESQL_URL_PREFIX = 'postgresql://';

interface EnvironmentInput {
  readonly NODE_ENV?: string;
  readonly JWT_SECRET?: string;
  readonly DATABASE_URL?: string;
}

/**
 * Validates required environment variables and production safety rules.
 */
export function validateEnvironment(
  config: EnvironmentInput,
): EnvironmentInput {
  const nodeEnv = config.NODE_ENV ?? 'development';
  const jwtSecret = config.JWT_SECRET?.trim() ?? '';
  const databaseUrl = config.DATABASE_URL?.trim() ?? '';
  if (nodeEnv === PRODUCTION_NODE_ENV) {
    if (jwtSecret.length === 0 || jwtSecret === DEFAULT_JWT_SECRET) {
      throw new Error(
        'JWT_SECRET must be set to a non-default value in production',
      );
    }
    if (databaseUrl.length === 0) {
      throw new Error('DATABASE_URL must be set in production');
    }
  }
  if (
    databaseUrl.length > 0 &&
    !databaseUrl.startsWith(SQLITE_URL_PREFIX) &&
    !databaseUrl.startsWith(POSTGRESQL_URL_PREFIX)
  ) {
    throw new Error('DATABASE_URL must use sqlite:// or postgresql:// scheme');
  }
  if (nodeEnv !== PRODUCTION_NODE_ENV && jwtSecret.length === 0) {
    return { ...config, JWT_SECRET: DEFAULT_JWT_SECRET };
  }
  return config;
}
