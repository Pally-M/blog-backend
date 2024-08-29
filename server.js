const express = require("express");
const cors = require("cors");
const path = require("path");
const connection = require("./db"); // Import the database connection

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes

// Get all posts
app.get("/posts", (req, res) => {
  connection.query("SELECT * FROM BlogPost", (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Get a single post by ID
app.get("/posts/:id", (req, res) => {
  const { id } = req.params;
  connection.query("SELECT * FROM BlogPost WHERE PostId = ?", [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  });
});

// Create a new post with validation
app.post("/posts", (req, res) => {
  const { title, image, content, userId } = req.body;

  if (!title || !image || !content || !userId) {
    return res.status(400).json({
      message: "All fields (title, image, content, userId) are required.",
    });
  }

  const sql = "INSERT INTO BlogPost (Title, Image, Content, UserId) VALUES (?, ?, ?, ?)";
  connection.query(sql, [title, image, content, userId], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: results.insertId, title, image, content, userId });
  });
});

// Add a comment to a post
app.post("/posts/:id/comments", (req, res) => {
  const { id } = req.params;
  const { text, userId } = req.body;

  if (!text || !userId) {
    return res.status(400).json({ message: "Comment text and userId are required" });
  }

  const sql = "INSERT INTO Comment (CommentText, PostId, UserId) VALUES (?, ?, ?)";
  connection.query(sql, [text, id, userId], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: results.insertId, text, postId: id, userId });
  });
});

// Delete all comments from a post
app.delete("/posts/:id/comments", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM Comment WHERE PostId = ?";
  connection.query(sql, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(200).json({ message: "All comments deleted" });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
