import { Module } from '@nestjs/common';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { DomainExceptionFilter } from './filters/domain-exception.filter';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { NonProductionGuard } from './guards/non-production.guard';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

/**
 * Shared module for cross-cutting utilities reused across feature modules.
 */
@Module({
  providers: [
    AllExceptionsFilter,
    DomainExceptionFilter,
    HttpExceptionFilter,
    LoggingInterceptor,
    NonProductionGuard,
  ],
  exports: [
    AllExceptionsFilter,
    DomainExceptionFilter,
    HttpExceptionFilter,
    LoggingInterceptor,
    NonProductionGuard,
  ],
})
export class CommonModule {}
