import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NonProductionGuard } from './non-production.guard';

describe('NonProductionGuard', () => {
  it('should allow access outside production', () => {
    const mockConfigService = {
      get: jest.fn().mockReturnValue('development'),
    } as unknown as ConfigService;
    const guard = new NonProductionGuard(mockConfigService);
    expect(guard.canActivate()).toBe(true);
  });

  it('should throw NotFoundException in production', () => {
    const mockConfigService = {
      get: jest.fn().mockReturnValue('production'),
    } as unknown as ConfigService;
    const guard = new NonProductionGuard(mockConfigService);
    expect(() => guard.canActivate()).toThrow(NotFoundException);
  });
});
