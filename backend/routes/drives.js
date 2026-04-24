const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM drives ORDER BY drive_date DESC');
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM drives WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Drive not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, location, drive_date, start_time, end_time, target_units, organizer, status, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO drives (name, location, drive_date, start_time, end_time, target_units, organizer, status, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [name, location, drive_date, start_time, end_time, target_units, organizer, status || 'planned', notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { status, collected_units, notes } = req.body;
    const result = await pool.query(
      'UPDATE drives SET status=$1, collected_units=$2, notes=$3, updated_at=NOW() WHERE id=$4 RETURNING *',
      [status, collected_units, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Drive not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
