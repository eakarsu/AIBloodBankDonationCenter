const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM donations ORDER BY donation_date DESC');
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM donations WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Donation not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { donor_id, donation_type, status, donation_date, center_id, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO donations (donor_id, donation_type, status, donation_date, center_id, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [donor_id, donation_type, status || 'scheduled', donation_date, center_id, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const result = await pool.query(
      'UPDATE donations SET status=$1, notes=$2, updated_at=NOW() WHERE id=$3 RETURNING *',
      [status, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Donation not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
