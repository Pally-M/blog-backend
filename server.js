const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');  // Import cors

const app = express();
const PORT = 5000;
const postsFilePath = path.join(__dirname, 'posts.json');

// Middleware
app.use(bodyParser.json());
app.use(cors());  // Enable CORS

// Helper functions
const getPosts = () => {
    if (!fs.existsSync(postsFilePath)) {
        fs.writeFileSync(postsFilePath, JSON.stringify([]));
    }
    const data = fs.readFileSync(postsFilePath);
    return JSON.parse(data);
};

const savePosts = (posts) => {
    fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2));
};

// Routes

// Get all posts
app.get('/api/posts', (req, res) => {
    fs.readFile('./data/posts.json', (err, data) => {
        if (err) {
            res.status(500).send({ message: 'Error reading file' });
            } else {
                res.json(JSON.parse(data));
                }
    });
});

app.post('/api/posts', (req, res) => {
    const { title, content, image } = req.body;
    if (!title || !content || !image) {
        return res.status(400).json({ message: 'Title, content, and image are required' });
    }
    
    const posts = getPosts();
    const newPost = {
        id: Date.now(),
        title,
        content,
        image
    };
    posts.push(newPost);
    savePosts(posts);
    res.status(201).json(newPost);
});

app.delete('/posts/:id', (req, res) => {
    const postId = parseInt(req.params.id, 10);
    let posts = getPosts();
    posts = posts.filter(post => post.id !== postId);
    savePosts(posts);
    res.status(200).json({ message: 'Post deleted' });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
