jest.mock('@mikro-orm/core', () => ({
  MikroORM: class MikroORM {},
}));

import { MikroORM } from '@mikro-orm/core';
import { ConfigService } from '@nestjs/config';
import { DatabaseMigrationService } from './database-migration.service';

describe('DatabaseMigrationService', () => {
  it('should skip MikroORM migrations for postgresql URLs', async () => {
    const mockMigratorUp = jest.fn().mockResolvedValue(undefined);
    const mockOrm = {
      migrator: { up: mockMigratorUp },
    } as unknown as MikroORM;
    const mockConfigService = {
      get: jest.fn().mockReturnValue('postgresql://localhost:5432/app'),
    } as unknown as ConfigService;
    const service = new DatabaseMigrationService(mockOrm, mockConfigService);
    await service.onModuleInit();
    expect(mockMigratorUp).not.toHaveBeenCalled();
  });

  it('should run MikroORM migrations for sqlite URLs', async () => {
    const mockMigratorUp = jest.fn().mockResolvedValue(undefined);
    const mockOrm = {
      migrator: { up: mockMigratorUp },
    } as unknown as MikroORM;
    const mockConfigService = {
      get: jest.fn().mockReturnValue('sqlite://./data/app.db'),
    } as unknown as ConfigService;
    const service = new DatabaseMigrationService(mockOrm, mockConfigService);
    await service.onModuleInit();
    expect(mockMigratorUp).toHaveBeenCalled();
  });
});
