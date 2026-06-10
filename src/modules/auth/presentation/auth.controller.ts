import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ApiStandardErrors } from '../../../common/decorators/api-error-responses.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { unwrapDomainResult } from '../../../common/result';
import { AuthService } from '../application/auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

/**
 * HTTP controller for authentication operations.
 */
@ApiTags('auth')
@ApiStandardErrors()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registers a new user account.
   */
  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  async register(@Body() input: RegisterDto): Promise<AuthResponseDto> {
    const result = await this.authService.register(input.email, input.password);
    return unwrapDomainResult(result);
  }

  /**
   * Authenticates a user and returns a JWT access token.
   */
  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('login')
  @ApiOperation({ summary: 'Login and receive JWT access token' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  async login(@Body() input: LoginDto): Promise<AuthResponseDto> {
    const result = await this.authService.login(input.email, input.password);
    return unwrapDomainResult(result);
  }
}
