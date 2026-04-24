const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM screenings ORDER BY screening_date DESC');
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM screenings WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Screening not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { donation_id, donor_id, hemoglobin, blood_pressure_systolic, blood_pressure_diastolic, pulse, temperature, weight, questionnaire_responses, result: screenResult, screened_by } = req.body;
    const result = await pool.query(
      'INSERT INTO screenings (donation_id, donor_id, hemoglobin, blood_pressure_systolic, blood_pressure_diastolic, pulse, temperature, weight, questionnaire_responses, result, screened_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',
      [donation_id, donor_id, hemoglobin, blood_pressure_systolic, blood_pressure_diastolic, pulse, temperature, weight, JSON.stringify(questionnaire_responses), screenResult, screened_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
