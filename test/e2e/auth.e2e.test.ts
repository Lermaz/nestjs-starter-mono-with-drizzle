import assert from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp, type AuthResponseBody } from './helpers/test-app';

void describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  void it('POST /auth/register and POST /auth/login return access token', async () => {
    const email = 'e2e-user@example.com';
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'password123' });
    assert.strictEqual(registerResponse.status, 201);
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'password123' });
    assert.strictEqual(loginResponse.status, 201);
    const authBody = loginResponse.body as AuthResponseBody;
    assert.strictEqual(typeof authBody.accessToken, 'string');
  });
});
