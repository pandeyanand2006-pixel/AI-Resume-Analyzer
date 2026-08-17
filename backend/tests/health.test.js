const request = require('supertest');
const app = require('../server');

describe('Health endpoint', () => {
  test('GET /api/health should return 200', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message');
  });
});
