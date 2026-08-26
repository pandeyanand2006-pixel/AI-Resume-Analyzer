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

describe('Job matching integration', () => {
  test('job-matching with jobDescription returns jobMatch', async () => {
    // create user
    const user = await User.create({ name: 'Bob', email: 'bob@example.com', password: 'hashed', role: 'user' });

    // create resume analyzed for user
    const resume = await Resume.create({
      user: user._id,
      originalName: 'resume.pdf',
      fileName: 'resume.pdf',
      filePath: '/tmp/resume.pdf',
      fileType: 'application/pdf',
      fileSize: 1024,
      extractedText: 'Experienced React and Node developer with MongoDB and Docker',
      skills: ['react','node','mongodb','docker'],
      keywords: ['react','node','mongodb','docker']
    });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const jd = 'We need a React developer with Node.js, MongoDB and Docker experience';

    const res = await request(app)
      .post(`/api/job-matching/${resume._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ jobDescription: jd });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('jobMatch');
    expect(res.body.jobMatch).toHaveProperty('overallMatchPercentage');
  });
});
