import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard API error response returned by global exception filters.
 */
export class ApiErrorResponseDto {
  @ApiProperty({ example: 400 })
  readonly statusCode!: number;

  @ApiProperty({
    oneOf: [
      { type: 'string', example: 'Todo title cannot be empty' },
      {
        type: 'array',
        items: { type: 'string' },
        example: ['title must be a string'],
      },
    ],
  })
  readonly message!: string | string[];

  @ApiProperty({ example: '2026-06-10T12:00:00.000Z' })
  readonly timestamp!: string;

  @ApiProperty({ example: '/todos' })
  readonly path!: string;
}
