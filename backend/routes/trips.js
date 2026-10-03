const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// POST /api/trips - Create new trip
router.post('/', authenticateToken, (req, res) => {
  const { gross_income, tip, payment_type, date } = req.body;
  const driver_id = req.user.id;

  // Validate required fields
  if (!gross_income || !payment_type || !date) {
    return res.status(400).json({ error: 'gross_income, payment_type, and date are required' });
  }

  const query = `INSERT INTO trips (driver_id, gross_income, tip, payment_type, date) VALUES (?, ?, ?, ?, ?)`;
  
  db.run(query, [driver_id, gross_income, tip || 0, payment_type, date], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create trip' });
    }

    res.status(201).json({
      id: this.lastID,
      driver_id,
      gross_income,
      tip,
      payment_type,
      date,
      created_at: new Date().toISOString()
    });
  });
});

// GET /api/trips - Get all trips for current user
router.get('/', authenticateToken, (req, res) => {
  const driver_id = req.user.id;
  const query = `SELECT * FROM trips WHERE driver_id = ? ORDER BY date DESC`;
  
  db.all(query, [driver_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch trips' });
    }
    res.json(rows);
  });
});

// GET /api/trips?date=YYYY-MM-DD - Get trips for specific date
router.get('/', authenticateToken, (req, res) => {
  const { date } = req.query;
  const driver_id = req.user.id;
  
  if (date) {
    const query = `SELECT * FROM trips WHERE driver_id = ? AND date = ?`;
    db.all(query, [driver_id, date], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch trips' });
      res.json(rows);
    });
  } else {
    const query = `SELECT * FROM trips WHERE driver_id = ? ORDER BY date DESC`;
    db.all(query, [driver_id], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch trips' });
      res.json(rows);
    });
  }
});

module.exports = router;