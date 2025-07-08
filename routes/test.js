// routes/test.js
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

router.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS now');
    res.json({ dbTime: rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
