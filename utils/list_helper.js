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
  const most_books = _.chain(blogs)
    .groupBy('author')
    .map((items, key) => {
      return {
        author: key,
        blogs: items.length,
      };
    })
    .maxBy('blogs')
    .value();

  return most_books;
};

const mostLikes = (blogs) => {
  const most_likes = _.chain(blogs)
    .groupBy('author')
    .map((items, key) => {
      return {
        author: key,
        likes: _.sumBy(items, 'likes'),
      };
    })
    .maxBy('likes')
    .value();
  return most_likes;
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
