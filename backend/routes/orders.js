const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { hospital_name, blood_type, component_type, units_requested, urgency, requested_by, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO orders (hospital_name, blood_type, component_type, units_requested, urgency, requested_by, notes, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [hospital_name, blood_type, component_type, units_requested, urgency || 'routine', requested_by, notes, 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const result = await pool.query(
      'UPDATE orders SET status=$1, notes=$2, updated_at=NOW() WHERE id=$3 RETURNING *',
      [status, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
