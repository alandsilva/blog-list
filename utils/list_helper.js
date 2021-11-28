const _ = require('lodash');
const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((total, blog) => total + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  return _.maxBy(blogs, 'likes');
};

const mostBlogs = (blogs) => {
  const authors = _.countBy(blogs, 'author');
  const author_blogs = _.map(authors, (value, key) => {
    return {
      author: key,
      blogs: value,
    };
  });
  return _.maxBy(author_blogs, 'blogs');
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
};
