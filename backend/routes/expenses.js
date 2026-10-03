const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// POST /api/expenses - Create new expense
router.post('/', authenticateToken, (req, res) => {
  const { category, amount, date, description } = req.body;
  const driver_id = req.user.id;

  // Validate required fields
  if (!category || !amount || !date) {
    return res.status(400).json({ error: 'category, amount, and date are required' });
  }

  // Validate category
  const validCategories = ['fuel', 'food', 'parking', 'other'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  const query = `INSERT INTO expenses (driver_id, category, amount, date, description) VALUES (?, ?, ?, ?, ?)`;
  
  db.run(query, [driver_id, category, amount, date, description || null], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create expense' });
    }

    res.status(201).json({
      id: this.lastID,
      driver_id,
      category,
      amount,
      date,
      description,
      created_at: new Date().toISOString()
    });
  });
});

// GET /api/expenses - Get all expenses for current user
router.get('/', authenticateToken, (req, res) => {
  const driver_id = req.user.id;
  const query = `SELECT * FROM expenses WHERE driver_id = ? ORDER BY date DESC`;
  
  db.all(query, [driver_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch expenses' });
    }
    res.json(rows);
  });
});

// GET /api/expenses?date=YYYY-MM-DD - Get expenses for specific date
router.get('/', authenticateToken, (req, res) => {
  const { date } = req.query;
  const driver_id = req.user.id;
  
  if (date) {
    const query = `SELECT * FROM expenses WHERE driver_id = ? AND date = ?`;
    db.all(query, [driver_id, date], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch expenses' });
      res.json(rows);
    });
  } else {
    const query = `SELECT * FROM expenses WHERE driver_id = ? ORDER BY date DESC`;
    db.all(query, [driver_id], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch expenses' });
      res.json(rows);
    });
  }
});

module.exports = router;