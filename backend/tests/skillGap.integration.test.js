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

  app = require('../server');

  await mongoose.connect(process.env.MONGO_URI, { family: 4 });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Skill gap integration', () => {
  test('POST /api/skill-gap/:resumeId returns skillGap', async () => {
    const user = await User.create({ name: 'Alice', email: 'alice@example.com', password: 'hashed', role: 'user' });

    const resume = await Resume.create({
      user: user._id,
      originalName: 'resume.pdf',
      fileName: 'resume.pdf',
      filePath: '/tmp/resume.pdf',
      fileType: 'application/pdf',
      fileSize: 1024,
      extractedText: 'Experienced frontend developer with React, HTML, CSS and Git',
      skills: ['react','html','css','git'],
      keywords: ['react','html','css']
    });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .post(`/api/skill-gap/${resume._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ targetRole: 'frontend developer' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('skillGap');
    expect(res.body.skillGap).toHaveProperty('skillMatchPercentage');
  });
});
