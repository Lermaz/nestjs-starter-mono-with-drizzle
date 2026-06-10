import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { NonProductionGuard } from '../../../common/guards/non-production.guard';
import { HealthService } from '../application/health.service';

/**
 * Controller for health check endpoints.
 */
@Public()
@ApiTags('health')
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Root health endpoint.
   */
  @Get()
  @ApiOperation({ summary: 'Root health check' })
  @ApiResponse({ status: 200, description: 'Hello World response' })
  getHello(): string {
    return this.healthService.getHello();
  }

  /**
   * Smoke test endpoint for health module verification.
   */
  @UseGuards(NonProductionGuard)
  @Get('health/test')
  @ApiOperation({ summary: 'Health module smoke test' })
  @ApiResponse({ status: 200, description: 'OK status' })
  getTest(): { status: string } {
    return this.healthService.getTestResponse();
  }

  /**
   * Readiness endpoint that verifies database connectivity.
   */
  @Get('health/ready')
  @ApiOperation({ summary: 'Readiness check with database connectivity' })
  @ApiResponse({
    status: 200,
    description: 'Readiness status with todos count',
  })
  getReadiness(): Promise<{ status: string; database: 'ok' | 'error' }> {
    return this.healthService.getReadiness();
  }
}
