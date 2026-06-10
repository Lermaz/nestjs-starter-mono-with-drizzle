import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthConfig } from '../../core/config/auth.config';
import { AuthService } from './application/auth.service';
import { USER_REPOSITORY } from './application/ports/user.repository.port';
import { UserEntity } from './infrastructure/entities/user.entity';
import { MikroUserRepository } from './infrastructure/repositories/mikro-user.repository';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { AuthPublicApi } from './public/auth-public.api';
import { AuthController } from './presentation/auth.controller';

/**
 * Authentication module for user persistence and JWT issuance.
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MikroOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtSecret = configService.get<AuthConfig['jwtSecret']>(
          'auth.jwtSecret',
          'change-me-in-production',
        );
        const jwtExpiresIn = configService.get<AuthConfig['jwtExpiresIn']>(
          'auth.jwtExpiresIn',
          '1d',
        );
        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: jwtExpiresIn as `${number}${'s' | 'm' | 'h' | 'd'}`,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthPublicApi,
    JwtStrategy,
    {
      provide: USER_REPOSITORY,
      useClass: MikroUserRepository,
    },
  ],
  exports: [AuthPublicApi],
})
export class AuthModule {}
