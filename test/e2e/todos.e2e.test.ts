import assert from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  createTestApp,
  registerAndLogin,
  type TodoPageResponseBody,
  type TodoResponseBody,
} from './helpers/test-app';

void describe('TodosController (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;

  beforeEach(async () => {
    app = await createTestApp();
    accessToken = await registerAndLogin(app, 'todos-user@example.com');
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  void it('GET /todos/admin/test returns ok', async () => {
    const response = await request(app.getHttpServer()).get(
      '/todos/admin/test',
    );
    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.body, { status: 'ok' });
  });

  void it('GET /todos returns 401 without token', async () => {
    const response = await request(app.getHttpServer()).get('/todos');
    assert.strictEqual(response.status, 401);
  });

  void it('POST /todos rejects invalid body', async () => {
    const response = await request(app.getHttpServer())
      .post('/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: '' });
    assert.strictEqual(response.status, 400);
  });

  void it('POST /todos creates and GET /todos lists paginated', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'E2E todo' });
    assert.strictEqual(createResponse.status, 201);
    const createdTodo = createResponse.body as TodoResponseBody;
    assert.strictEqual(createdTodo.title, 'E2E todo');
    const listResponse = await request(app.getHttpServer())
      .get('/todos')
      .set('Authorization', `Bearer ${accessToken}`);
    assert.strictEqual(listResponse.status, 200);
    const page = listResponse.body as TodoPageResponseBody;
    assert.strictEqual(page.items.length, 1);
    assert.strictEqual(page.items[0]?.title, 'E2E todo');
    assert.strictEqual(page.nextCursor, null);
  });

  void it('PATCH /todos/:id updates a todo', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Before patch' });
    const createdTodo = createResponse.body as TodoResponseBody;
    const patchResponse = await request(app.getHttpServer())
      .patch(`/todos/${createdTodo.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'After patch', isCompleted: true });
    assert.strictEqual(patchResponse.status, 200);
    const patchedTodo = patchResponse.body as TodoResponseBody;
    assert.strictEqual(patchedTodo.title, 'After patch');
    assert.strictEqual(patchedTodo.isCompleted, true);
  });

  void it('DELETE /todos/:id removes a todo', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Delete me' });
    const createdTodo = createResponse.body as TodoResponseBody;
    const deleteResponse = await request(app.getHttpServer())
      .delete(`/todos/${createdTodo.id}`)
      .set('Authorization', `Bearer ${accessToken}`);
    assert.strictEqual(deleteResponse.status, 204);
    const getResponse = await request(app.getHttpServer())
      .get(`/todos/${createdTodo.id}`)
      .set('Authorization', `Bearer ${accessToken}`);
    assert.strictEqual(getResponse.status, 404);
  });

  void it('GET /todos does not return another user todos', async () => {
    const otherUserToken = await registerAndLogin(
      app,
      'other-user@example.com',
    );
    await request(app.getHttpServer())
      .post('/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'User A todo' });
    const listResponse = await request(app.getHttpServer())
      .get('/todos')
      .set('Authorization', `Bearer ${otherUserToken}`);
    assert.strictEqual(listResponse.status, 200);
    const page = listResponse.body as TodoPageResponseBody;
    assert.strictEqual(page.items.length, 0);
  });
});
