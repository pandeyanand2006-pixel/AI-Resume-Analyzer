const request = require('supertest');
const app = require('../server');

describe('Job matching auth', () => {
  test('POST /api/job-matching/:resumeId without token returns 401', async () => {
    const res = await request(app)
      .post('/api/job-matching/64b2f6f7f0f0f0f0f0f0f0f0')
      .send({ jobDescription: 'Sample job description' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });
});
