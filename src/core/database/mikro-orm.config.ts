import { Migrator } from '@mikro-orm/migrations';
import { defineConfig, SqliteDriver, type Options } from '@mikro-orm/sqlite';

const DEFAULT_DATABASE_URL = 'sqlite://./data/app.db';
const MIGRATIONS_PATH = './dist/migrations';
const MIGRATIONS_PATH_TS = './src/migrations';

/**
 * Builds MikroORM options from a database connection URL.
 *
 * Entities are discovered globally for MikroORM boot, but each entity file
 * must live inside its owning feature module; never import entities across
 * module boundaries.
 */
export function buildMikroOrmOptions(databaseUrl: string): Options {
  const dbName = resolveSqlitePath(databaseUrl);
  return defineConfig({
    driver: SqliteDriver,
    dbName,
    entities: ['./dist/**/*.entity.js'],
    entitiesTs: ['./src/**/*.entity.ts'],
    extensions: [Migrator],
    migrations: {
      path: MIGRATIONS_PATH,
      pathTs: MIGRATIONS_PATH_TS,
    },
  });
}

/**
 * Returns MikroORM options using the default database URL.
 */
export function getDefaultMikroOrmOptions(): Options {
  return buildMikroOrmOptions(process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL);
}

function resolveSqlitePath(databaseUrl: string): string {
  if (databaseUrl === 'sqlite://:memory:') {
    return ':memory:';
  }
  const sqlitePrefix = 'sqlite://';
  if (databaseUrl.startsWith(sqlitePrefix)) {
    return databaseUrl.slice(sqlitePrefix.length);
  }
  return databaseUrl;
}
