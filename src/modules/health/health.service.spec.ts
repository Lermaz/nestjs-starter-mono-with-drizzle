import { Test, TestingModule } from '@nestjs/testing';
import { DATABASE_HEALTH } from '../../core/database/ports/database-health.port';
import { HealthService } from './application/health.service';

describe('HealthService', () => {
  let healthService: HealthService;
  let mockDatabaseHealth: { checkConnectivity: jest.Mock };

  beforeEach(async () => {
    mockDatabaseHealth = {
      checkConnectivity: jest.fn(),
    };
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: DATABASE_HEALTH,
          useValue: mockDatabaseHealth,
        },
      ],
    }).compile();
    healthService = app.get<HealthService>(HealthService);
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(healthService.getHello()).toBe('Hello World!');
    });
  });

  describe('getTestResponse', () => {
    it('should return ok status', () => {
      expect(healthService.getTestResponse()).toEqual({ status: 'ok' });
    });
  });

  describe('getReadiness', () => {
    it('should return ok when database is healthy', async () => {
      mockDatabaseHealth.checkConnectivity.mockResolvedValue(true);
      const actualResult = await healthService.getReadiness();
      expect(actualResult).toEqual({ status: 'ok', database: 'ok' });
    });

    it('should return error when database is unhealthy', async () => {
      mockDatabaseHealth.checkConnectivity.mockResolvedValue(false);
      const actualResult = await healthService.getReadiness();
      expect(actualResult).toEqual({ status: 'error', database: 'error' });
    });
  });
});
