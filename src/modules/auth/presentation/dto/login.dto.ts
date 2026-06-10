import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

/**
 * Input DTO for user login (HTTP shape only).
 */
export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  readonly email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  readonly password!: string;
}
