const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/summary?date=YYYY-MM-DD - Get daily summary
router.get('/', authenticateToken, (req, res) => {
  const { date } = req.query;
  const driver_id = req.user.id;
  
  if (!date) {
    return res.status(400).json({ error: 'date query parameter is required' });
  }

  // Get total income (gross + tips)
  const incomeQuery = `
    SELECT 
      COALESCE(SUM(gross_income), 0) as total_gross,
      COALESCE(SUM(tip), 0) as total_tips
    FROM trips
    WHERE driver_id = ? AND date = ?
  `;
  
  // Get total expenses
  const expenseQuery = `
    SELECT 
      COALESCE(SUM(amount), 0) as total_expenses
    FROM expenses
    WHERE driver_id = ? AND date = ?
  `;

  // Get target
  const targetQuery = `
    SELECT target_amount FROM daily_targets
    WHERE driver_id = ? AND date = ?
  `;

  // Get expense breakdown
  const breakdownQuery = `
    SELECT category, SUM(amount) as total
    FROM expenses
    WHERE driver_id = ? AND date = ?
    GROUP BY category
  `;

  // Get payment type breakdown
  const paymentQuery = `
    SELECT 
      payment_type,
      SUM(gross_income + tip) as total
    FROM trips
    WHERE driver_id = ? AND date = ?
    GROUP BY payment_type
  `;

  // Execute all queries
  let completed = 0;
  let incomeData = { total_gross: 0, total_tips: 0 };
  let expenseData = { total_expenses: 0 };
  let targetData = null;
  let breakdown = [];
  let paymentBreakdown = [];

  function checkComplete() {
    completed++;
    if (completed < 5) return;

    const totalIncome = incomeData.total_gross + incomeData.total_tips;
    const netIncome = totalIncome - expenseData.total_expenses;
    const targetAmount = targetData ? targetData.target_amount : 0;
    const targetAchieved = targetAmount > 0 ? netIncome >= targetAmount : false;
    const targetProgress = targetAmount > 0 ? Math.min((netIncome / targetAmount) * 100, 100) : 0;

    res.json({
      date,
      total_gross: incomeData.total_gross,
      total_tips: incomeData.total_tips,
      total_income: totalIncome,
      total_expenses: expenseData.total_expenses,
      net_income: netIncome,
      target_amount: targetAmount,
      target_achieved: targetAchieved,
      target_progress: targetProgress,
      expense_breakdown: breakdown,
      payment_breakdown: paymentBreakdown
    });
  }

  db.all(incomeQuery, [driver_id, date], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch income' });
    incomeData = rows[0];
    checkComplete();
  });

  db.all(expenseQuery, [driver_id, date], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch expenses' });
    expenseData = rows[0];
    checkComplete();
  });

  db.get(targetQuery, [driver_id, date], (err, row) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch target' });
    targetData = row;
    checkComplete();
  });

  db.all(breakdownQuery, [driver_id, date], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch breakdown' });
    breakdown = rows;
    checkComplete();
  });

  db.all(paymentQuery, [driver_id, date], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch payment breakdown' });
    paymentBreakdown = rows;
    checkComplete();
  });
});

module.exports = router;