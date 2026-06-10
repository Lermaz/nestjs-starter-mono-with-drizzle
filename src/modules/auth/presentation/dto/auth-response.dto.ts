import { ApiProperty } from '@nestjs/swagger';

/**
 * Output shape for authentication API responses.
 */
export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  readonly accessToken!: string;
}
