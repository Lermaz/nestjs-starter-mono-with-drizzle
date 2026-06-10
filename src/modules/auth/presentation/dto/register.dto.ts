import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

/**
 * Input DTO for user registration (HTTP shape only).
 */
export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  readonly email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  readonly password!: string;
}
