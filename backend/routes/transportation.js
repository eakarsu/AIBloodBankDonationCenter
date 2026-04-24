const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM transportation ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM transportation WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Transport record not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { order_id, origin, destination, carrier, departure_time, estimated_arrival, temperature_controlled, status } = req.body;
    const result = await pool.query(
      'INSERT INTO transportation (order_id, origin, destination, carrier, departure_time, estimated_arrival, temperature_controlled, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [order_id, origin, destination, carrier, departure_time, estimated_arrival, temperature_controlled, status || 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { status, actual_arrival, notes } = req.body;
    const result = await pool.query(
      'UPDATE transportation SET status=$1, actual_arrival=$2, notes=$3, updated_at=NOW() WHERE id=$4 RETURNING *',
      [status, actual_arrival, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Transport record not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
