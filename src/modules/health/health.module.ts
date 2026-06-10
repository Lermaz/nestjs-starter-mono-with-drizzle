import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { HealthService } from './application/health.service';
import { HealthController } from './presentation/health.controller';

/**
 * Health module for application status and smoke test endpoints.
 */
@Module({
  imports: [CommonModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
