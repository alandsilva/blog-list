const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const User = require('../models/user');

beforeEach(async () => {
  await User.deleteMany({});
  const newUser = new User({
    username: 'testuser',
    name: 'Test User',
    passwordHash:
      '$2b$10$G/3dZZ0DxMrxXffNzgWerutRkmMa8hxrx7yNMdFBzZ9PmVMdGKjza',
  });
  await newUser.save();
});

describe('user login', () => {
  test('user can login with right credentials', async () => {
    const credentials = {
      username: 'testuser',
      password: 'test',
    };
    const result = await api
      .post('/api/login')
      .send(credentials)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(result.body.token).toBeDefined();
  });

  test('wrong credentials give proper error', async () => {
    const credentials = {
      username: 'testuser',
      password: 'wrong',
    };
    const result = await api
      .post('/api/login')
      .send(credentials)
      .expect(401)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('invalid username or password');
  });
});

afterAll(() => {
  mongoose.connection.close();
});
