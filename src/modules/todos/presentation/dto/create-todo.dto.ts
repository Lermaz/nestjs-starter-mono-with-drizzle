import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

/**
 * Input DTO for creating a todo (HTTP shape only).
 */
export class CreateTodoDto {
  @ApiProperty({ example: 'Buy groceries' })
  @IsString()
  readonly title!: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  readonly isCompleted?: boolean;
}
