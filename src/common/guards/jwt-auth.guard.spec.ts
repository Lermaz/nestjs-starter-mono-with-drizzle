import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let mockReflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>>;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: jest.fn(),
    };
    jwtAuthGuard = new JwtAuthGuard(mockReflector as unknown as Reflector);
  });

  it('should allow access for @Public() routes', () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
    expect(jwtAuthGuard.canActivate(mockContext)).toBe(true);
  });
});
