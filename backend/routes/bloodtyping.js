const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT bt.*, c.donation_id, bt.rh_type AS rh_factor, bt.hepatitis_b AS hbv_test, bt.hepatitis_c AS hcv_test, bt.test_date AS testing_date FROM blood_tests bt LEFT JOIN collections c ON c.id = bt.collection_id ORDER BY bt.test_date DESC NULLS LAST, bt.id DESC');
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT bt.*, c.donation_id, bt.rh_type AS rh_factor, bt.hepatitis_b AS hbv_test, bt.hepatitis_c AS hcv_test, bt.test_date AS testing_date FROM blood_tests bt LEFT JOIN collections c ON c.id = bt.collection_id WHERE bt.id = $1', [req.params.id]);
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
