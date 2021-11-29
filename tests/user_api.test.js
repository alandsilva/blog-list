const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const bcrypt = require('bcrypt');
const User = require('../models/user');
const helper = require('./test_helper');

beforeEach(async () => {
  console.log('deleteing users');
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash('sekret', 10);
  const user = new User({ username: 'root', passwordHash });

  console.log('saving user');
  await user.save();
  console.log('user saved');
});

describe('creating user', () => {
  test('succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'alandsilva',
      name: 'Alan Da Silva',
      password: 'secrets',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test('fails with with a taken username', async () => {
    const usersAtStart = await helper.usersInDb();
    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('`username` to be unique');

    const usersAtEnd = await helper.usersInDb();

    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test('fails with with a short password (less than 3 characters)', async () => {
    const usersAtStart = await helper.usersInDb();
    const newUser = {
      username: 'shorty',
      name: 'Superuser',
      password: 'sa',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain(
      'Password must have minimum 3 characters'
    );

    const usersAtEnd = await helper.usersInDb();

    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
