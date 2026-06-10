import { Test, TestingModule } from '@nestjs/testing';
import { NonProductionGuard } from '../../common/guards/non-production.guard';
import { DATABASE_HEALTH } from '../../core/database/ports/database-health.port';
import { HealthService } from './application/health.service';
import { HealthController } from './presentation/health.controller';

describe('HealthController', () => {
  let healthController: HealthController;
  let mockDatabaseHealth: { checkConnectivity: jest.Mock };

  beforeEach(async () => {
    mockDatabaseHealth = {
      checkConnectivity: jest.fn().mockResolvedValue(true),
    };
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: DATABASE_HEALTH,
          useValue: mockDatabaseHealth,
        },
      ],
    })
      .overrideGuard(NonProductionGuard)
      .useValue({ canActivate: (): boolean => true })
      .compile();
    healthController = app.get<HealthController>(HealthController);
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(healthController.getHello()).toBe('Hello World!');
    });
  });

  describe('getTest', () => {
    it('should return ok status', () => {
      expect(healthController.getTest()).toEqual({ status: 'ok' });
    });
  });

  describe('getReadiness', () => {
    it('should return readiness with database status', async () => {
      const actualResult = await healthController.getReadiness();
      expect(actualResult).toEqual({ status: 'ok', database: 'ok' });
    });
  });
});
