const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt=require('jsonwebtoken');
const secret='adfsdafsdafsdafsda'
dotenv.config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://uk:Johnreese12@ac-8vamrsc-shard-00-00.5gtysml.mongodb.net:27017,ac-8vamrsc-shard-00-01.5gtysml.mongodb.net:27017,ac-8vamrsc-shard-00-02.5gtysml.mongodb.net:27017/?ssl=true&replicaSet=atlas-3b3cma-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB', error);
  });

// Define User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});

const User = mongoose.model('User', userSchema);

// Define BlogPost schema and model
const blogPostSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: { type:mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

// Routes
app.post('/api/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error signing up', error);
    res.status(500).json({ error: 'Failed to sign up' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      throw new Error('Invalid login credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error('Invalid login credentials');
    }
    else{
    jwt.sign({username,id:user._id},secret,{},(err,token)=>{

      if(err) throw err;
      res.status(200).json({ token });
    });

  }
  } catch (error) {
    console.error('Error logging in', error);
    res.status(401).json({ error: 'Invalid login credentials' });
  }
});

app.post('/api/posts',async (req, res) => {
  try {
    // Check if user is authenticated
    // You can implement your own authentication logic here, such as checking for a valid session or API key
    // For simplicity, we're skipping the authentication check in this example

    const { title, content , authorId} = req.body;
    const post = new BlogPost({ title, content, author:authorId });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.patch('/api/posts/:id', async (req, res) => {
  try {
    // Check if user is authenticated
    // You can implement your own authentication logic here, such as checking for a valid session or API key
    // For simplicity, we're skipping the authentication check in this example

    const { id } = req.params;
    const { title, content } = req.body;
    const post = await BlogPost.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.title = title;
    post.content = content;

    await post.save();
    res.json(post);
  } catch (error) {
    console.error('Error updating post', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    // Check if user is authenticated
    // You can implement your own authentication logic here, such as checking for a valid session or API key
    // For simplicity, we're skipping the authentication check in this example

    const { id } = req.params;
    const post = await BlogPost.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await BlogPost.deleteOne({ _id: id });
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting post', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
  
  
});
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await BlogPost.find().populate('author');
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});
// ...

app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id).populate('author');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// ...
