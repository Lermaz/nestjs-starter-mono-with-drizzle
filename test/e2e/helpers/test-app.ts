import { createRequire } from 'node:module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

export interface TodoResponseBody {
  readonly id: string;
  readonly title: string;
  readonly isCompleted: boolean;
  readonly createdAt: string;
}

export interface ReadinessResponseBody {
  readonly status: string;
  readonly database: 'ok' | 'error';
}

export interface TodoPageResponseBody {
  readonly items: TodoResponseBody[];
  readonly nextCursor: string | null;
}

export interface AuthResponseBody {
  readonly accessToken: string;
}

const nodeRequire = createRequire(import.meta.url);

/**
 * Creates a Nest application for end-to-end tests.
 */
export async function createTestApp(): Promise<INestApplication<App>> {
  process.env.DATABASE_URL = 'sqlite://:memory:';
  process.env.JWT_SECRET = 'e2e-test-secret';
  const { AppModule } = nodeRequire('../../../dist/app.module') as {
    AppModule: new () => unknown;
  };
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const { configureHttpSecurity } = nodeRequire(
    '../../../dist/core/http/configure-http',
  ) as {
    configureHttpSecurity: (
      app: INestApplication,
      config: { port: number; nodeEnv: string; corsOrigins: readonly string[] },
    ) => void;
  };
  const app = moduleFixture.createNestApplication<NestExpressApplication>({
    bodyParser: false,
  });
  configureHttpSecurity(app, {
    port: 3000,
    nodeEnv: 'test',
    corsOrigins: [],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  await app.init();
  return app;
}

/**
 * Registers and logs in a user, returning a JWT access token.
 */
export async function registerAndLogin(
  app: INestApplication<App>,
  email: string,
): Promise<string> {
  const password = 'password123';
  await request(app.getHttpServer())
    .post('/auth/register')
    .send({ email, password });
  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password });
  const authBody = loginResponse.body as AuthResponseBody;
  return authBody.accessToken;
}
