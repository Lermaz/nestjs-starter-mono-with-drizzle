import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { resolveRequestId } from '../utils/request-id.util';

const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Assigns a unique request ID to each HTTP request.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const requestId = resolveRequestId(
      request.headers[REQUEST_ID_HEADER] as string | undefined,
    );
    request.requestId = requestId;
    response.setHeader(REQUEST_ID_HEADER, requestId);
    next();
  }
}
