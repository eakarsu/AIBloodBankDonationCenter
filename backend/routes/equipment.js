const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM equipment ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM equipment WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Equipment not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, type, serial_number, status, location, last_maintenance, next_maintenance, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO equipment (name, type, serial_number, status, location, last_maintenance, next_maintenance, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [name, type, serial_number, status || 'operational', location, last_maintenance, next_maintenance, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { status, last_maintenance, next_maintenance, notes } = req.body;
    const result = await pool.query(
      'UPDATE equipment SET status=$1, last_maintenance=$2, next_maintenance=$3, notes=$4, updated_at=NOW() WHERE id=$5 RETURNING *',
      [status, last_maintenance, next_maintenance, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Equipment not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
