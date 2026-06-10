import { join } from 'node:path';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DRIZZLE_DB = Symbol('DRIZZLE_DB');

export type DrizzleDb = NodePgDatabase<typeof schema>;

const DRIZZLE_MIGRATIONS_FOLDER = 'drizzle';

/**
 * Resolves the absolute path to Drizzle SQL migration files.
 */
export function resolveDrizzleMigrationsFolder(): string {
  return join(process.cwd(), DRIZZLE_MIGRATIONS_FOLDER);
}

/**
 * Creates a PostgreSQL connection pool for Drizzle.
 */
export function createDrizzlePool(databaseUrl: string): Pool {
  return new Pool({ connectionString: databaseUrl });
}

/**
 * Creates a Drizzle database client from an existing pool.
 */
export function createDrizzleDb(pool: Pool): DrizzleDb {
  return drizzle({ client: pool, schema, casing: 'snake_case' });
}
