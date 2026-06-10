import {
  Inject,
  Injectable,
} from '../../../common/nest/application.decorators';
import { DATABASE_HEALTH } from '../../../core/database/ports/database-health.port';
import type { DatabaseHealthPort } from '../../../core/database/ports/database-health.port';
import type { ReadinessResponse } from '../public/readiness-response';

/**
 * Service for health check operations.
 */
@Injectable()
export class HealthService {
  constructor(
    @Inject(DATABASE_HEALTH)
    private readonly databaseHealth: DatabaseHealthPort,
  ) {}

  /**
   * Returns a hello world message for the root health endpoint.
   */
  getHello(): string {
    return 'Hello World!';
  }

  /**
   * Returns a smoke test response for health verification.
   */
  getTestResponse(): { status: string } {
    return { status: 'ok' };
  }

  /**
   * Returns readiness status including database connectivity.
   */
  async getReadiness(): Promise<ReadinessResponse> {
    const isDatabaseHealthy = await this.databaseHealth.checkConnectivity();
    return {
      status: isDatabaseHealthy ? 'ok' : 'error',
      database: isDatabaseHealthy ? 'ok' : 'error',
    };
  }
}
