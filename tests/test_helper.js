const Blog = require('../models/blog');
const User = require('../models/user');

const getInitialBlogs = (userId) => {
  let initialBlogs = [
    {
      title: 'React patterns',
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
      likes: 7,
    },
    {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
    },
    {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
    },
  ];

  initialBlogs = initialBlogs.map((blog) => {
    return { ...blog, user: userId.toString() };
  });

  return initialBlogs;
};

const blogsInDb = async () => {
  const notes = await Blog.find({});
  return notes.map((note) => note.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

const reset = async () => {
  // Clears users and creates a new one
  await User.deleteMany({});
  const newUser = new User({
    username: 'testuser',
    name: 'Test User',
    passwordHash:
      '$2b$10$G/3dZZ0DxMrxXffNzgWerutRkmMa8hxrx7yNMdFBzZ9PmVMdGKjza',
  });
  const user = await newUser.save();

  // Clearn blog database and populates, each with the newly created user
  await Blog.deleteMany({});
  await Blog.insertMany(getInitialBlogs(user._id));
};

module.exports = { reset, blogsInDb, usersInDb };
