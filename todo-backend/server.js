const express = require('express');
const db = require('./db');  // Import the database setup
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middleware');  // Import the JWT middleware
const cors = require('cors');  // Import CORS
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for requests from the frontend
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from your React app
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed HTTP methods
  credentials: true // Enable credentials if needed
}));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Create Users table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

// Create Tasks table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    user_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )
`);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to Todo App API');
});

// User signup route
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;

  db.get('SELECT email FROM users WHERE email = ?', [email], async (err, user) => {
    if (user) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    db.run('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)', [id, name, email, hashedPassword], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error registering user' });
      }
      const token = jwt.sign({ id }, 'your_jwt_secret', { expiresIn: '1h' });
      res.status(201).json({ token });
    });
  });
});

// User login route
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token });
  });
});

// Profile route (added for retrieving user profile info)
app.get('/api/profile', authenticateToken, (req, res) => {
  db.get('SELECT name, email FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Error retrieving user data' });
    }
    res.json(user);
  });
});

// Create a Todo
app.post('/api/todos', authenticateToken, (req, res) => {
  const { title, description } = req.body;
  const id = uuidv4();
  const userId = req.user.id;

  db.run('INSERT INTO tasks (id, title, description, user_id) VALUES (?, ?, ?, ?)', [id, title, description, userId], (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating task' });
    }
    res.status(201).json({ message: 'Task created successfully' });
  });
});

// Retrieve All Todos for the User
app.get('/api/todos', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all('SELECT * FROM tasks WHERE user_id = ?', [userId], (err, tasks) => {
    if (err) {
      return res.status(500).json({ message: 'Error retrieving tasks' });
    }
    res.json(tasks);
  });
});

// Update a Task
app.put('/api/todos/:id', authenticateToken, (req, res) => {
  const { title, description, status } = req.body;
  const taskId = req.params.id;

  // Validate status if provided
  const validStatuses = ['pending', 'in progress', 'completed', 'done'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status provided' });
  }

  // Check if the task exists before updating
  db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, task) => {
    if (err) {
      return res.status(500).json({ message: 'Error retrieving task' });
    }
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update the task
    db.run('UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?', [
      title || task.title,
      description || task.description,
      status || task.status,
      taskId
    ], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating task' });
      }
      res.json({ message: 'Task updated successfully' });
    });
  });
});

// Delete a Task
app.delete('/api/todos/:id', authenticateToken, (req, res) => {
  const taskId = req.params.id;

  db.run('DELETE FROM tasks WHERE id = ?', [taskId], (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting task' });
    }
    res.json({ message: 'Task deleted successfully' });
  });
});

// Handle preflight requests (CORS)
app.options('*', cors()); // Allow preflight requests

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
