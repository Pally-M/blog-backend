const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Create a connection to the database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

});


// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL database");
});

// Get all posts
app.get("/posts", (req, res) => {
  db.query("SELECT * FROM posts", (err, results) => {
    if (err) {
      console.error("Error fetching posts:", err);
      return res.status(500).json({ message: "Error fetching posts" });
    }
    res.json(results);
  });
});

// Get a single post by ID
app.get("/posts/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM posts WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Error fetching post:", err);
      return res.status(500).json({ message: "Error fetching post" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(results[0]);
  });
});

// Create a new post
app.post("/posts", (req, res) => {
  const { title, content, image } = req.body;
  if (!title || !content || !image) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const post = { title, content, image };
  db.query("INSERT INTO posts SET ?", post, (err, results) => {
    if (err) {
      console.error("Error creating post:", err);
      return res.status(500).json({ message: "Error creating post" });
    }
    res.status(201).json({ id: results.insertId, ...post });
  });
});

// Add a comment to a post
app.post("/posts/:id/comments", (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ message: "Comment text is required" });
  }
  const comment = { post_id: id, text };
  db.query("INSERT INTO comments SET ?", comment, (err, results) => {
    if (err) {
      console.error("Error adding comment:", err);
      return res.status(500).json({ message: "Error adding comment" });
    }
    res.status(201).json({ id: results.insertId, ...comment });
  });
});

// Delete all comments from a post
app.delete("/posts/:id/comments", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM comments WHERE post_id = ?", [id], (err, results) => {
    if (err) {
      console.error("Error deleting comments:", err);
      return res.status(500).json({ message: "Error deleting comments" });
    }
    res.status(200).json({ message: "All comments deleted" });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
