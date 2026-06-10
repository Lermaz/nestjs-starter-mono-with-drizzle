import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  Inject,
  Injectable,
} from '../../../common/nest/application.decorators';
import { DomainError } from '../../../common/errors/domain.error';
import { err, ok } from '../../../common/result/result.helpers';
import type { Result } from '../../../common/result/result';
import { AuthConfig } from '../../../core/config/auth.config';
import { normalizeEmail } from '../domain/email.normalization';
import {
  assertEmailAvailable,
  assertPasswordMeetsPolicy,
  INVALID_CREDENTIALS_MESSAGE,
} from '../domain/registration.rules';
import type { AuthTokenPayload } from '../public/auth-token-payload';
import { USER_REPOSITORY } from './ports/user.repository.port';
import type { UserRepositoryPort } from './ports/user.repository.port';

export interface AuthTokenResult {
  readonly accessToken: string;
}

/**
 * Application service for authentication operations.
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registers a new user with the given credentials.
   */
  async register(
    email: string,
    password: string,
  ): Promise<Result<AuthTokenResult, DomainError>> {
    const normalizedEmail = normalizeEmail(email);
    const passwordResult = assertPasswordMeetsPolicy(password);
    if (!passwordResult.ok) {
      return passwordResult;
    }
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    const emailResult = assertEmailAvailable(existingUser);
    if (!emailResult.ok) {
      return emailResult;
    }
    const passwordHash = await this.hashPassword(password);
    const user = await this.userRepository.save({
      email: normalizedEmail,
      passwordHash,
    });
    const accessToken = await this.signToken(user.id, user.email);
    return ok({ accessToken });
  }

  /**
   * Authenticates a user and returns a JWT access token.
   */
  async login(
    email: string,
    password: string,
  ): Promise<Result<AuthTokenResult, DomainError>> {
    const normalizedEmail = normalizeEmail(email);
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      return err(new DomainError(INVALID_CREDENTIALS_MESSAGE, 401));
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return err(new DomainError(INVALID_CREDENTIALS_MESSAGE, 401));
    }
    const accessToken = await this.signToken(user.id, user.email);
    return ok({ accessToken });
  }

  private async hashPassword(password: string): Promise<string> {
    const bcryptRounds = this.configService.get<AuthConfig['bcryptRounds']>(
      'auth.bcryptRounds',
      10,
    );
    return bcrypt.hash(password, bcryptRounds);
  }

  private async signToken(userId: string, email: string): Promise<string> {
    const payload: AuthTokenPayload = { userId, email };
    return this.jwtService.signAsync(payload);
  }
}
