import { ApiProperty } from '@nestjs/swagger';

/**
 * Output shape for todo API responses.
 */
export class TodoResponseDto {
  @ApiProperty({ example: '00000000-0000-0000-0000-000000000001' })
  readonly id!: string;

  @ApiProperty({ example: 'Buy groceries' })
  readonly title!: string;

  @ApiProperty({ example: false })
  readonly isCompleted!: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  readonly createdAt!: Date;
}
