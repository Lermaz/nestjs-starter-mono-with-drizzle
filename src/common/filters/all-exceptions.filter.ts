import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AppConfig } from '../../core/config/app.config';

interface ApiErrorResponse {
  readonly statusCode: number;
  readonly message: string;
  readonly timestamp: string;
  readonly path: string;
}

const PRODUCTION_NODE_ENV = 'production';
const INTERNAL_SERVER_ERROR_MESSAGE = 'Internal server error';

/**
 * Catch-all filter for unhandled exceptions with a consistent JSON shape.
 */
@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = this.resolveMessage(exception);
    this.logger.error(
      `Unhandled exception on ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
    );
    const body: ApiErrorResponse = {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };
    response.status(statusCode).json(body);
  }

  private resolveMessage(exception: unknown): string {
    const nodeEnv = this.configService.get<AppConfig['nodeEnv']>(
      'app.nodeEnv',
      'development',
    );
    if (nodeEnv === PRODUCTION_NODE_ENV) {
      return INTERNAL_SERVER_ERROR_MESSAGE;
    }
    if (exception instanceof Error) {
      return exception.message;
    }
    return INTERNAL_SERVER_ERROR_MESSAGE;
  }
}
