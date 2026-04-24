const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM staff ORDER BY last_name ASC');
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM staff WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Staff member not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { first_name, last_name, email, phone, role, department, certification, status } = req.body;
    const result = await pool.query(
      'INSERT INTO staff (first_name, last_name, email, phone, role, department, certification, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [first_name, last_name, email, phone, role, department, certification, status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { role, department, certification, status } = req.body;
    const result = await pool.query(
      'UPDATE staff SET role=$1, department=$2, certification=$3, status=$4, updated_at=NOW() WHERE id=$5 RETURNING *',
      [role, department, certification, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Staff member not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
