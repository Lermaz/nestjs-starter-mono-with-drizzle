import assert from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp, type ReadinessResponseBody } from './helpers/test-app';

void describe('HealthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  void it('GET / returns Hello World', async () => {
    const response = await request(app.getHttpServer()).get('/');
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.text, 'Hello World!');
  });

  void it('GET /health/test returns ok', async () => {
    const response = await request(app.getHttpServer()).get('/health/test');
    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.body, { status: 'ok' });
  });

  void it('GET /health/ready returns ok with database status', async () => {
    const response = await request(app.getHttpServer()).get('/health/ready');
    assert.strictEqual(response.status, 200);
    const readiness = response.body as ReadinessResponseBody;
    assert.strictEqual(readiness.status, 'ok');
    assert.strictEqual(readiness.database, 'ok');
  });
});
