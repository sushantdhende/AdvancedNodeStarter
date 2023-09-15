const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');

// const Blog = mongoose.model('Blog');
const Blog = [
  {_id: 1, title: 'title 1', content: 'sdfoish osihdiof hasiodfjoasidjf i[oajdf ioajdfioajs dfiojaiodf oaidjf oia djfoiaj dfoias d'},
  {_id: 2, title: 'title 2', content: 'sdfoish osihdiof hasiodfjoasidjf i[oajdf ioajdfioajs dfiojaiodf oaidjf oia djfoiaj dfoias d'},
  {_id: 3, title: 'title 3', content: 'sdfoish osihdiof hasiodfjoasidjf i[oajdf ioajdfioajs dfiojaiodf oaidjf oia djfoiaj dfoias d'},
  {_id: 4, title: 'title 4', content: 'sdfoish osihdiof hasiodfjoasidjf i[oajdf ioajdfioajs dfiojaiodf oaidjf oia djfoiaj dfoias d'},
  {_id: 5, title: 'title 5', content: 'sdfoish osihdiof hasiodfjoasidjf i[oajdf ioajdfioajs dfiojaiodf oaidjf oia djfoiaj dfoias d'},
  {_id: 6, title: 'title 6', content: 'sdfoish osihdiof hasiodfjoasidjf i[oajdf ioajdfioajs dfiojaiodf oaidjf oia djfoiaj dfoias d'},
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

  app.get('/api/blogs', async (req, res) => {
    console.log('req.user==>',req.user);
    // const blogs = await Blog.find({ _user: req.user.id });
    // const blogs = await Blog.find({ _user: req.user.id });

    res.send(Blog);
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
