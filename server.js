const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const Comment = require('./models/comment');
const Post = require('./models/post');
const path = require('path');
const cors = require('cors'); // Import cors

const app = express();
app.use(cors()); // Use cors middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost/blog-cms', { useNewUrlParser: true, useUnifiedTopology: true });

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.status(201).send('User registered');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret');
    res.json({ token });
  } else {
    res.status(401).send('Invalid credentials');
  }
});

app.post('/posts/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const comment = new Comment({ postId, content });
  await comment.save();
  res.status(201).send('Comment added');
});

app.get('/posts/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  const comments = await Comment.find({ postId });
  res.json(comments);
});

app.get('/search', async (req, res) => {
  const { query } = req.query;
  const posts = await Post.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } }
    ]
  });
  res.json(posts);
});

app.post('/posts', async (req, res) => {
  const { title, content } = req.body;
  const post = new Post({ title, content });
  await post.save();
  res.status(201).send('Post created');
});

app.get('/posts', async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
});

app.put('/posts/:postId', async (req, res) => {
  const { postId } = req.params;
  const { title, content } = req.body;
  await Post.findByIdAndUpdate(postId, { title, content });
  res.status(200).send('Post updated');
});

app.delete('/posts/:postId', async (req, res) => {
  const { postId } = req.params;
  await Post.findByIdAndDelete(postId);
  res.status(200).send('Post deleted');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

