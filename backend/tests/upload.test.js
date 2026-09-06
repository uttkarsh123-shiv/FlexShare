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

describe('POST /api/uploads', () => {
  it('returns 400 when no file is attached', async () => {
    const res = await request(app)
      .post('/api/uploads')
      .field('conversionType', 'none');

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it('returns 400 for an invalid conversionType', async () => {
    const res = await request(app)
      .post('/api/uploads')
      .attach('file', Buffer.from('hello'), 'test.txt')
      .field('conversionType', 'invalid->type');

    expect(res.statusCode).toBe(400);
  });

  it('returns 400 for a password shorter than 4 characters', async () => {
    const res = await request(app)
      .post('/api/uploads')
      .attach('file', Buffer.from('hello'), 'test.txt')
      .field('conversionType', 'none')
      .field('password', 'ab');

    expect(res.statusCode).toBe(400);
  });

  it('returns 400 when maxDownloads is out of range', async () => {
    const res = await request(app)
      .post('/api/uploads')
      .attach('file', Buffer.from('hello'), 'test.txt')
      .field('conversionType', 'none')
      .field('maxDownloads', '200');

    expect(res.statusCode).toBe(400);
  });
});
