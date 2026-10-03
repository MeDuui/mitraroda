const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// POST /api/targets - Set or update daily target
router.post('/', authenticateToken, (req, res) => {
  const { target_amount, date } = req.body;
  const driver_id = req.user.id;

  if (!target_amount || !date) {
    return res.status(400).json({ error: 'target_amount and date are required' });
  }

  // Upsert: insert or update if exists
  const query = `
    INSERT INTO daily_targets (driver_id, target_amount, date)
    VALUES (?, ?, ?)
    ON CONFLICT(driver_id, date) DO UPDATE SET target_amount = excluded.target_amount
  `;
  
  db.run(query, [driver_id, target_amount, date], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to set target' });
    }

    res.json({
      driver_id,
      target_amount,
      date,
      message: 'Target set successfully'
    });
  });
});

// GET /api/targets - Get all targets for current user
router.get('/', authenticateToken, (req, res) => {
  const driver_id = req.user.id;
  const query = `SELECT * FROM daily_targets WHERE driver_id = ? ORDER BY date DESC`;
  
  db.all(query, [driver_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch targets' });
    }
    res.json(rows);
  });
});

// GET /api/targets?date=YYYY-MM-DD - Get target for specific date
router.get('/', authenticateToken, (req, res) => {
  const { date } = req.query;
  const driver_id = req.user.id;
  
  if (date) {
    const query = `SELECT * FROM daily_targets WHERE driver_id = ? AND date = ?`;
    db.get(query, [driver_id, date], (err, row) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch target' });
      if (!row) return res.json({ target_amount: 0, achieved_amount: 0, date });
      res.json(row);
    });
  } else {
    const query = `SELECT * FROM daily_targets WHERE driver_id = ? ORDER BY date DESC`;
    db.all(query, [driver_id], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch targets' });
      res.json(rows);
    });
  }
});

module.exports = router;