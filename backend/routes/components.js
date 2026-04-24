const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM components ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM components WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Component not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { donation_id, component_type, volume_ml, blood_type, expiration_date, status } = req.body;
    const result = await pool.query(
      'INSERT INTO components (donation_id, component_type, volume_ml, blood_type, expiration_date, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [donation_id, component_type, volume_ml, blood_type, expiration_date, status || 'available']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
