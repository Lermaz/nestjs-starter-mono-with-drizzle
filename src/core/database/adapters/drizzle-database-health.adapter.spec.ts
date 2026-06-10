import { DrizzleDatabaseHealthAdapter } from './drizzle-database-health.adapter';

describe('DrizzleDatabaseHealthAdapter', () => {
  it('should return true when select 1 succeeds', async () => {
    const mockDb = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    const adapter = new DrizzleDatabaseHealthAdapter(
      mockDb as ConstructorParameters<typeof DrizzleDatabaseHealthAdapter>[0],
    );
    const actualResult = await adapter.checkConnectivity();
    expect(actualResult).toBe(true);
    expect(mockDb.execute).toHaveBeenCalled();
  });

  it('should return false when select 1 fails', async () => {
    const mockDb = {
      execute: jest.fn().mockRejectedValue(new Error('connection refused')),
    };
    const adapter = new DrizzleDatabaseHealthAdapter(
      mockDb as ConstructorParameters<typeof DrizzleDatabaseHealthAdapter>[0],
    );
    const actualResult = await adapter.checkConnectivity();
    expect(actualResult).toBe(false);
  });
});
