import { DrizzleMigrationService } from './drizzle-migration.service';

jest.mock('drizzle-orm/node-postgres/migrator', () => ({
  migrate: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('./drizzle.provider', () => ({
  resolveDrizzleMigrationsFolder: jest.fn().mockReturnValue('/app/drizzle'),
}));

import { migrate } from 'drizzle-orm/node-postgres/migrator';

describe('DrizzleMigrationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should skip migrations when drizzle client is not configured', async () => {
    const service = new DrizzleMigrationService(null);
    await service.onModuleInit();
    expect(migrate).not.toHaveBeenCalled();
  });

  it('should run migrations when drizzle client is configured', async () => {
    const mockDb = {};
    const service = new DrizzleMigrationService(
      mockDb as ConstructorParameters<typeof DrizzleMigrationService>[0],
    );
    await service.onModuleInit();
    expect(migrate).toHaveBeenCalledWith(mockDb, {
      migrationsFolder: '/app/drizzle',
    });
  });
});
