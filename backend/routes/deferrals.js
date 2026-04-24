const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM deferrals ORDER BY deferral_date DESC');
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM deferrals WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Deferral not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { donor_id, deferral_type, reason, deferral_date, end_date, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO deferrals (donor_id, deferral_type, reason, deferral_date, end_date, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [donor_id, deferral_type, reason, deferral_date, end_date, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
