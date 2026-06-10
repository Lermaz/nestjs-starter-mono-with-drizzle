import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { AppConfig } from '../config/app.config';

const JSON_BODY_LIMIT = '100kb';

/**
 * Applies HTTP security middleware: helmet, body size limits, and CORS.
 */
export function configureHttpSecurity(
  app: INestApplication,
  config: AppConfig,
): void {
  const expressApp = app as NestExpressApplication;
  expressApp.use(helmet());
  expressApp.use(json({ limit: JSON_BODY_LIMIT }));
  expressApp.use(urlencoded({ extended: true, limit: JSON_BODY_LIMIT }));
  if (config.corsOrigins.length > 0) {
    expressApp.enableCors({
      origin: [...config.corsOrigins],
      credentials: true,
    });
  }
}
