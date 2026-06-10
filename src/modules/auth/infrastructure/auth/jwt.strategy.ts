import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthConfig } from '../../../../core/config/auth.config';
import { AuthPublicApi } from '../../public/auth-public.api';
import type { AuthTokenPayload } from '../../public/auth-token-payload';

/**
 * Passport strategy for validating JWT access tokens.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authPublicApi: AuthPublicApi,
  ) {
    const jwtSecret = configService.get<AuthConfig['jwtSecret']>(
      'auth.jwtSecret',
      'change-me-in-production',
    );
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: AuthTokenPayload): Promise<AuthTokenPayload> {
    const user = await this.authPublicApi.validateUser(payload.userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
