const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');

// const Blog = mongoose.model('Blog');
const Blog = [
  {_user: 1},
  {_user: 2},
  {_user: 3},
  {_user: 4},
  {_user: 5},
  {_user: 6},
];

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const redis = require('redis');
    const redisUrl = 'redis://127.0.0.1:6379';
    const client = redis.createClient(redisUrl);
    const util = require('util');
    client.get = util.promisify(client.get);

    const cachedBlogs = await client.get(req.user.id);

    if (cachedBlogs) {
      console.log('SERVING FROM CACHE');
      return res.send(JSON.parse(cachedBlogs));
    }

    const blogs = await Blog.find({ _user: req.user.id });

    // const blog = await Blog.findOne({
    //   _user: req.user.id,
    //   _id: req.params.id
    // });

    console.log('SERVING FROM Mongo');
    res.send(blog);
    client.set(req.user.id, JSON.stringify(blogs));
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
    const blogs = await Blog.find({ _user: req.user.id });

    res.send(blogs);
  });

  app.post('/api/blogs', requireLogin, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });
};
