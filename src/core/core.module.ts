import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CommonModule } from '../common/common.module';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';
import { DomainExceptionFilter } from '../common/filters/domain-exception.filter';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { RequestIdMiddleware } from '../common/middleware/request-id.middleware';
import { AuthModule } from '../modules/auth/auth.module';
import { appConfig } from './config/app.config';
import { authConfig } from './config/auth.config';
import { databaseConfig } from './config/database.config';
import { validateEnvironment } from './config/env.validation';
import { DatabaseModule } from './database/database.module';

/**
 * Core module that registers global configuration and cross-cutting providers.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, databaseConfig],
      validate: validateEnvironment,
    }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    DatabaseModule,
    CommonModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useExisting: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useExisting: DomainExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useExisting: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useExisting: LoggingInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
