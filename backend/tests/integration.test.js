require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
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

// ── POST /api/uploads ──────────────────────────────────────────────────────────

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
      .field('conversionType', 'video->mp4');
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

  it('returns 200 and a share code on a valid upload', async () => {
    const res = await request(app)
      .post('/api/uploads')
      .attach('file', Buffer.from('hello world'), 'test.txt')
      .field('conversionType', 'none');
    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBeDefined();
    expect(res.body.code).toHaveLength(6);
  });
});

// ── GET /api/file/:code/info ───────────────────────────────────────────────────

describe('GET /api/file/:code/info', () => {
  it('returns 400 for a code shorter than 6 characters', async () => {
    const res = await request(app).get('/api/file/ABC/info');
    expect(res.statusCode).toBe(400);
  });

  it('returns 404 for a non-existent code', async () => {
    const res = await request(app).get('/api/file/ZZZZZZ/info');
    expect(res.statusCode).toBe(404);
  });

  it('returns file info for a code that was just uploaded', async () => {
    const upload = await request(app)
      .post('/api/uploads')
      .attach('file', Buffer.from('test content'), 'hello.txt')
      .field('conversionType', 'none')
      .field('description', 'test file');

    expect(upload.statusCode).toBe(200);
    const { code } = upload.body;

    const res = await request(app).get(`/api/file/${code}/info`);
    expect(res.statusCode).toBe(200);
    expect(res.body.originalFileName).toBe('hello.txt');
    expect(res.body.description).toBe('test file');
    expect(res.body.hasPassword).toBe(false);
  });
});
