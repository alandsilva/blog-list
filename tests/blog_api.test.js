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

describe('when there are initially some blog posts', () => {
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

  test('a specific blog is returned', async () => {
    const response = await helper.blogsInDb();
    expect(response[0].title).toBe('React patterns');
  });

  test('identifier is named id', async () => {
    const response = await helper.blogsInDb();
    expect(response[0].id).toBeDefined();
  });
});

describe('addition of a new blog', () => {
  test('succeds with valid data', async () => {
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
  test('succeds and likes defaults to 0 if likes is missing from request', async () => {
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

  test('fails with status code 400 if title or url missing from request', async () => {
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
});

describe('updating a blog', () => {
  test('succeeds with valid data', async () => {
    const responseBefore = await helper.blogsInDb();
    let modifiedBlog = {
      title: 'Angular Wave',
      author: 'Another Tech guy',
      url: 'https://fullstackopen.com',
      likes: 5,
    };

    console.log(modifiedBlog);

    await api
      .put(`/api/blogs/${responseBefore[0].id}`)
      .send(modifiedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const responseAfter = await helper.blogsInDb();
    expect(responseAfter[0].title).toEqual('Angular Wave');
    expect(responseAfter[0].id).toEqual(responseBefore[0].id);
  });
});

describe('deletion of a blog', () => {
  test('succeeds with status code 204 ', async () => {
    const responseBefore = await helper.blogsInDb();
    await api.delete(`/api/blogs/${responseBefore[0].id}`).expect(204);
    const responseAfter = await helper.blogsInDb();
    expect(responseAfter).toHaveLength(responseBefore.length - 1);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
