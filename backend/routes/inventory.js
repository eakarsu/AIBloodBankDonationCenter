const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM inventory ORDER BY expiration_date ASC');
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/summary', async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT blood_type, component_type, COUNT(*) as units, MIN(expiration_date) as earliest_expiry FROM inventory WHERE status = 'available' GROUP BY blood_type, component_type ORDER BY blood_type"
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM inventory WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Inventory item not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { component_id, blood_type, component_type, volume_ml, expiration_date, location, status } = req.body;
    const result = await pool.query(
      'INSERT INTO inventory (component_id, blood_type, component_type, volume_ml, expiration_date, location, status) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [component_id, blood_type, component_type, volume_ml, expiration_date, location, status || 'available']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { status, location } = req.body;
    const result = await pool.query(
      'UPDATE inventory SET status=$1, location=$2, updated_at=NOW() WHERE id=$3 RETURNING *',
      [status, location, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Inventory item not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
