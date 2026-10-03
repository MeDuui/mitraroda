const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../db/database');
const { generateToken, authenticateToken } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', [
  body('username').trim().isLength({ min: 3 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;
  const passwordHash = bcrypt.hashSync(password, 10);

  const query = `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`;
  
  db.run(query, [username, email, passwordHash], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Username or email already exists' });
      }
      return res.status(500).json({ error: 'Failed to register user' });
    }

    const token = generateToken({ id: this.lastID, username, email });
    
    res.status(201).json({
      message: 'Registration successful',
      user: { id: this.lastID, username, email },
      token
    });
  });
});

// POST /api/auth/login
router.post('/login', [
  body('email').optional().isEmail().normalizeEmail(),
  body('username').optional().trim().escape(),
  body('password').exists()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;
  const identifier = username || email;

  if (!identifier) {
    return res.status(400).json({ error: 'Username or email required' });
  }

  const query = `SELECT * FROM users WHERE username = ? OR email = ?`;
  
  db.get(query, [identifier, identifier], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    
    res.json({
      message: 'Login successful',
      user: { id: user.id, username: user.username, email: user.email },
      token
    });
  });
});

// GET /api/auth/me (protected route)
router.get('/me', authenticateToken, (req, res) => {
  const query = `SELECT id, username, email, created_at FROM users WHERE id = ?`;
  
  db.get(query, [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  });
});

module.exports = router;
