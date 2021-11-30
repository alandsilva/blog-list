const middleware = require('../utils/middleware');
const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
    .find({})
    .populate('user', { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body;
  const user = request.user;
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id,
  });
  const result = await blog.save();

  const blogs = user.blogs.concat(result._id);
  await user.updateOne({ blogs: blogs });
  response.status(201).json(result);
});

blogsRouter.delete(
  '/:id',
  middleware.userExtractor,
  async (request, response) => {
    const blog = await Blog.findById(request.params.id);
    const user = request.user;

    if (blog.user.toString() === user._id.toString()) {
      blog.delete();
    } else {
      return response
        .status(401)
        .json({ error: 'user not allowed to delete this blog' });
    }
    response.status(204).end();
  }
);

blogsRouter.put('/:id', middleware.userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  const user = request.user;
  if (blog.user.toString() === user._id.toString()) {
    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      request.body
    );

    response.json(updatedBlog);
  } else {
    return response
      .status(401)
      .json({ error: 'user not allowed to update this blog' });
  }
});

module.exports = blogsRouter;
