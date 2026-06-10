import { registerAs } from '@nestjs/config';

const DEFAULT_PORT = 3000;
const PRODUCTION_NODE_ENV = 'production';

/**
 * Resolves whether Swagger should be exposed for the current environment.
 */
export function resolveSwaggerEnabled(
  nodeEnv: string,
  enableSwagger: string | undefined,
): boolean {
  const isProduction = nodeEnv === PRODUCTION_NODE_ENV;
  return !isProduction || enableSwagger === 'true';
}

export interface AppConfig {
  readonly port: number;
  readonly nodeEnv: string;
  readonly corsOrigins: readonly string[];
  readonly isSwaggerEnabled: boolean;
}

/**
 * Parses a comma-separated list of CORS origins.
 */
export function parseCorsOrigins(rawOrigins: string | undefined): string[] {
  if (!rawOrigins?.trim()) {
    return [];
  }
  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

/**
 * Application configuration loaded from environment variables.
 */
export const appConfig = registerAs('app', (): AppConfig => {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  return {
    port: parseInt(process.env.PORT ?? String(DEFAULT_PORT), 10),
    nodeEnv,
    corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
    isSwaggerEnabled: resolveSwaggerEnabled(
      nodeEnv,
      process.env.ENABLE_SWAGGER,
    ),
  };
});
