import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

/**
 * Input DTO for updating a todo (HTTP shape only).
 */
export class UpdateTodoDto {
  @ApiPropertyOptional({ example: 'Updated title' })
  @IsOptional()
  @IsString()
  readonly title?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  readonly isCompleted?: boolean;
}
