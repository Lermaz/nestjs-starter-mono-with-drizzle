import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponseDto } from '../dto/api-error-response.dto';

/**
 * Documents standard API error responses for Swagger.
 */
export function ApiStandardErrors(): ReturnType<typeof applyDecorators> {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Bad request',
      type: ApiErrorResponseDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
      type: ApiErrorResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Not found',
      type: ApiErrorResponseDto,
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict',
      type: ApiErrorResponseDto,
    }),
    ApiResponse({
      status: 429,
      description: 'Too many requests',
      type: ApiErrorResponseDto,
    }),
  );
}
