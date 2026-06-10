import { join } from 'node:path';
import { createRequire } from 'node:module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { PGlite } from '@electric-sql/pglite';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
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
const E2E_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/app';

type E2eDrizzleDb = ReturnType<typeof drizzle>;

let pgliteClient: PGlite | undefined;
let e2eDatabase: E2eDrizzleDb | undefined;

/**
 * Creates a Nest application for end-to-end tests.
 */
export async function createTestApp(): Promise<INestApplication<App>> {
  process.env.DATABASE_URL = E2E_DATABASE_URL;
  process.env.JWT_SECRET = 'e2e-test-secret';
  const database = await ensureE2eDatabase();
  const { AppModule } = nodeRequire('../../../dist/app.module') as {
    AppModule: new () => unknown;
  };
  const { DRIZZLE_DB } = nodeRequire(
    '../../../dist/core/database/drizzle.provider',
  ) as { DRIZZLE_DB: symbol };
  const { PG_POOL } = nodeRequire(
    '../../../dist/core/database/pg-pool.token',
  ) as { PG_POOL: symbol };
  const { DrizzleMigrationService } = nodeRequire(
    '../../../dist/core/database/drizzle-migration.service',
  ) as { DrizzleMigrationService: new () => unknown };
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(DRIZZLE_DB)
    .useValue(database)
    .overrideProvider(PG_POOL)
    .useValue({ end: (): Promise<void> => Promise.resolve() })
    .overrideProvider(DrizzleMigrationService)
    .useValue({ onModuleInit: (): Promise<void> => Promise.resolve() })
    .compile();
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
  await resetDatabase(database);
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

async function ensureE2eDatabase(): Promise<E2eDrizzleDb> {
  if (e2eDatabase) {
    return e2eDatabase;
  }
  const schema = nodeRequire(
    '../../../dist/core/database/schema/index',
  ) as Record<string, unknown>;
  pgliteClient = new PGlite();
  e2eDatabase = drizzle({ client: pgliteClient, schema, casing: 'snake_case' });
  await migrate(e2eDatabase, {
    migrationsFolder: join(process.cwd(), 'drizzle'),
  });
  return e2eDatabase;
}

async function resetDatabase(database: E2eDrizzleDb): Promise<void> {
  await database.execute(sql`truncate table todos, users cascade`);
}
