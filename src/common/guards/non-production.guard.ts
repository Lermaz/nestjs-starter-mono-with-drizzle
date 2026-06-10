import { CanActivate, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../core/config/app.config';

const PRODUCTION_NODE_ENV = 'production';

/**
 * Blocks route access in production environments.
 */
@Injectable()
export class NonProductionGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(): boolean {
    const nodeEnv = this.configService.get<AppConfig['nodeEnv']>(
      'app.nodeEnv',
      'development',
    );
    if (nodeEnv === PRODUCTION_NODE_ENV) {
      throw new NotFoundException();
    }
    return true;
  }
}
