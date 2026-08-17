const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
let app;

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  process.env.JWT_SECRET = 'testsecret';

  // require app after setting MONGO_URI
  app = require('../server');

  // wait for mongoose to connect
  await mongoose.connect(process.env.MONGO_URI, { family: 4 });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Auth flow', () => {
  test('Register and login user', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password' });

    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body).toHaveProperty('user');

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
  });
});
