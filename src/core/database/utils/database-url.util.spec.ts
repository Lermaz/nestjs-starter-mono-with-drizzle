import { isPostgresqlDatabaseUrl } from './database-url.util';

describe('isPostgresqlDatabaseUrl', () => {
  it('should return true for postgresql URLs', () => {
    expect(
      isPostgresqlDatabaseUrl(
        'postgresql://postgres:postgres@localhost:5432/app',
      ),
    ).toBe(true);
  });

  it('should return false for sqlite URLs', () => {
    expect(isPostgresqlDatabaseUrl('sqlite://./data/app.db')).toBe(false);
  });
});
