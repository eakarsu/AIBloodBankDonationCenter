const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET / - List all donors
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM donors ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { next(err); }
});

// GET /:id - Get donor by ID
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM donors WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Donor not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// POST / - Create donor
router.post('/', async (req, res, next) => {
  try {
    const { first_name, last_name, email, phone, date_of_birth, blood_type, address } = req.body;
    const result = await pool.query(
      'INSERT INTO donors (first_name, last_name, email, phone, date_of_birth, blood_type, address) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [first_name, last_name, email, phone, date_of_birth, blood_type, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

// PUT /:id - Update donor
router.put('/:id', async (req, res, next) => {
  try {
    const { first_name, last_name, email, phone, date_of_birth, blood_type, address } = req.body;
    const result = await pool.query(
      'UPDATE donors SET first_name=$1, last_name=$2, email=$3, phone=$4, date_of_birth=$5, blood_type=$6, address=$7, updated_at=NOW() WHERE id=$8 RETURNING *',
      [first_name, last_name, email, phone, date_of_birth, blood_type, address, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Donor not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// DELETE /:id - Delete donor
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM donors WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Donor not found' });
    res.json({ message: 'Donor deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
