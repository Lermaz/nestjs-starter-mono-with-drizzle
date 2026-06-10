const POSTGRESQL_URL_PREFIX = 'postgresql://';

/**
 * Returns whether the database URL targets PostgreSQL.
 */
export function isPostgresqlDatabaseUrl(databaseUrl: string): boolean {
  return databaseUrl.startsWith(POSTGRESQL_URL_PREFIX);
}
