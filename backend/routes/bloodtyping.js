const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM blood_typing ORDER BY tested_at DESC');
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM blood_typing WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Blood typing record not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { donation_id, abo_type, rh_factor, antibody_screen, tested_by, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO blood_typing (donation_id, abo_type, rh_factor, antibody_screen, tested_by, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [donation_id, abo_type, rh_factor, antibody_screen, tested_by, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
