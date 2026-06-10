import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface HttpExceptionResponse {
  readonly statusCode: number;
  readonly message: string | string[];
  readonly timestamp: string;
  readonly path: string;
}

/**
 * Global filter that formats HTTP exceptions into a consistent JSON response.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const message = this.extractMessage(exceptionResponse);
    const body: HttpExceptionResponse = {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };
    response.status(statusCode).json(body);
  }

  private extractMessage(
    exceptionResponse: string | object,
  ): string | string[] {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }
    const responseObject = exceptionResponse as { message?: string | string[] };
    return responseObject.message ?? 'Internal server error';
  }
}
