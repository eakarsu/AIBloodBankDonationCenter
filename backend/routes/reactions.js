const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM reactions ORDER BY reaction_time DESC');
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM reactions WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Reaction not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { donation_id, donor_id, reaction_type, severity, symptoms, treatment, reported_by, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO reactions (donation_id, donor_id, reaction_type, severity, symptoms, treatment, reported_by, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [donation_id, donor_id, reaction_type, severity, symptoms, treatment, reported_by, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
