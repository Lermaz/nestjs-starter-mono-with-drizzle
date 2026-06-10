import { defineConfig } from 'drizzle-kit';

const DEFAULT_DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5432/app';

/**
 * Drizzle Kit configuration for PostgreSQL migrations.
 */
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/core/database/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
  },
  migrations: {
    table: '__drizzle_migrations',
    schema: 'public',
  },
});
