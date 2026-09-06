const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const { getRedisConnection } = require('../queue/redisConnection');
const conversionQueue = require('../queue/conversionQueue');

afterAll(async () => {
  await conversionQueue.close();
  await getRedisConnection().quit();
  await mongoose.disconnect();
});

describe('GET /api/file/:code/info', () => {
  it('returns 400 for a code shorter than 6 characters', async () => {
    const res = await request(app).get('/api/file/ABC/info');
    expect(res.statusCode).toBe(400);
  });

  it('returns 404 for a non-existent code', async () => {
    const res = await request(app).get('/api/file/ZZZZZZ/info');
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/file/:code', () => {
  it('returns 400 for a code shorter than 6 characters', async () => {
    const res = await request(app).post('/api/file/ABC').send({});
    expect(res.statusCode).toBe(400);
  });

  it('returns 404 for a non-existent code', async () => {
    const res = await request(app).post('/api/file/ZZZZZZ').send({});
    expect(res.statusCode).toBe(404);
  });
});
