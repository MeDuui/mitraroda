const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// POST /api/export/pdf - placeholder
router.post('/pdf', authenticateToken, (req, res) => {
  res.json({
    message: 'PDF export requested',
    note: 'PDF generation backend akan disiapkan setelah Railway deploy'
  });
});

module.exports = router;