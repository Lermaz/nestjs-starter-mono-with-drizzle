import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainError } from '../errors/domain.error';

interface DomainExceptionResponse {
  readonly statusCode: number;
  readonly message: string;
  readonly timestamp: string;
  readonly path: string;
}

/**
 * Maps domain invariant violations to consistent HTTP responses.
 */
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const body: DomainExceptionResponse = {
      statusCode: exception.statusCode,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };
    response.status(exception.statusCode).json(body);
  }
}
