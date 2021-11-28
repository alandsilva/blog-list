const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');
const helper = require('./test_helper');

beforeEach(async () => {
  await Blog.deleteMany({});
  console.log('cleared');

  console.log('adding blogs');
  await Blog.insertMany(helper.initialBlogs);
  console.log('blogs added');
});

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('all blogs are returned', async () => {
  const response = await helper.blogsInDb();
  expect(response).toHaveLength(helper.initialBlogs.length);
});

test('identifier is named id', async () => {
  const response = await helper.blogsInDb();
  expect(response[0].id).toBeDefined();

  const responseAfter = await helper.blogsInDb();

  const titles = responseAfter.map((r) => r.title);

  expect(responseAfter).toHaveLength(helper.initialBlogs.length + 1);
  expect(titles).toContain('FullStackOpen 2021 review');
});

test('if likes is missing from request, defaults to 0', async () => {
  const newBlog = {
    title: 'A blog with no likes',
    author: 'John Doe',
    url: 'https://google.com',
  };
  const newlyAdded = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  expect(newlyAdded.body.likes).toBe(0);
});

test('if title or url missing from request, returns 400 Bad Request', async () => {
  const newBlog = {
    author: 'Alan Da Silva',
    likes: 11,
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/);
});

test('the first blog is about React patters', async () => {
  const response = await helper.blogsInDb();
  expect(response[0].title).toBe('React patterns');
});

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'FullStackOpen 2021 review',
    author: 'Alan Da Silva',
    url: 'https://fullstackopen.com',
    likes: 11,
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const responseAfter = await helper.blogsInDb();

  const titles = responseAfter.map((r) => r.title);

  expect(responseAfter).toHaveLength(helper.initialBlogs.length + 1);
  expect(titles).toContain('FullStackOpen 2021 review');
});
afterAll(() => {
  mongoose.connection.close();
});
