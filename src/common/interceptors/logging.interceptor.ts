import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import type { AuthTokenPayload } from '../../modules/auth/public';

interface StructuredLogEntry {
  readonly requestId?: string;
  readonly userId?: string;
  readonly method: string;
  readonly url: string;
  readonly statusCode: number;
  readonly durationMs: number;
}

/**
 * Logs incoming HTTP requests as structured JSON with request and user IDs.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();
    const { method, url } = request;
    const startedAt = Date.now();
    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startedAt;
        const authenticatedUser = request.user as AuthTokenPayload | undefined;
        const logEntry: StructuredLogEntry = {
          requestId: request.requestId,
          userId: authenticatedUser?.userId,
          method,
          url,
          statusCode: response.statusCode,
          durationMs,
        };
        this.logger.log(JSON.stringify(logEntry));
      }),
    );
  }
}
