import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const DEFAULT_PAGE_LIMIT = 20;
const MAX_PAGE_LIMIT = 100;

/**
 * Query parameters for paginated todo listing.
 */
export class ListTodosQueryDto {
  @ApiPropertyOptional({
    description: 'Cursor (todo id) for the next page',
    example: '00000000-0000-0000-0000-000000000001',
  })
  @IsOptional()
  @IsString()
  readonly cursor?: string;

  @ApiPropertyOptional({
    description: 'Maximum items per page',
    example: DEFAULT_PAGE_LIMIT,
    default: DEFAULT_PAGE_LIMIT,
    maximum: MAX_PAGE_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_LIMIT)
  readonly limit?: number;
}
