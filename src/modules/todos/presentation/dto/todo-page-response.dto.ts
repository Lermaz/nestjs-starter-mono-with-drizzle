import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TodoResponseDto } from './todo-response.dto';

/**
 * Paginated todo list response.
 */
export class TodoPageResponseDto {
  @ApiProperty({ type: TodoResponseDto, isArray: true })
  readonly items!: TodoResponseDto[];

  @ApiPropertyOptional({
    nullable: true,
    description: 'Cursor for the next page, or null when no more results',
    example: '00000000-0000-0000-0000-000000000002',
  })
  readonly nextCursor!: string | null;
}
