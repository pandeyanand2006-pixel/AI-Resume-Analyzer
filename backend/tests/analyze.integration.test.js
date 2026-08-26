const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');

let app;
let mongoServer;

const User = require('../models/User');
const Resume = require('../models/Resume');
const jwt = require('jsonwebtoken');

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  process.env.JWT_SECRET = 'testsecret';
  process.env.NODE_ENV = 'test';

  app = require('../server');

  await mongoose.connect(process.env.MONGO_URI, { family: 4 });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Resume analyze integration', () => {
  test('POST /api/resumes/:id/analyze processes resume', async () => {
    const user = await User.create({ name: 'Test', email: 'test2@example.com', password: 'hashed', role: 'user' });

    const resume = await Resume.create({
      user: user._id,
      originalName: 'resume.pdf',
      fileName: 'resume.pdf',
      filePath: '/tmp/resume.pdf',
      fileType: 'application/pdf',
      fileSize: 1024,
      extractedText: 'Experienced full stack developer with React and Node.js',
      skills: [],
      keywords: []
    });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .post(`/api/resumes/${resume._id}/analyze`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('resume');
    expect(res.body.resume).toHaveProperty('status');
  });
});
