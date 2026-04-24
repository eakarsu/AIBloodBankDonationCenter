const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM rewards ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/donor/:donorId', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM rewards WHERE donor_id = $1 ORDER BY created_at DESC', [req.params.donorId]);
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM rewards WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Reward not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { donor_id, reward_type, points, description, status } = req.body;
    const result = await pool.query(
      'INSERT INTO rewards (donor_id, reward_type, points, description, status) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [donor_id, reward_type, points, description, status || 'earned']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE rewards SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Reward not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
