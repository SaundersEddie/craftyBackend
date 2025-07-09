// routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db/connection');
const verifyToken = require('../middleware/verifyToken');

// POST /api/users/register
router.post('/register', async (req, res) => {
  const { email, first_name, last_name, password, theme_palette } = req.body;

  try {
    // Check if user already exists
    const userCheck = await pool.query('SELECT 1 FROM users WHERE email = $1', [
      email,
    ]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Convert theme_palette (string) to theme_id (int)
    const themeResult = await pool.query(
      'SELECT id FROM themes WHERE name = $1',
      [theme_palette]
    );
    if (themeResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid theme_palette' });
    }
    const theme_id = themeResult.rows[0].id;

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user with correct types
    const newUser = await pool.query(
      `INSERT INTO users (email, first_name, last_name, password_hash, theme_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, theme_id`,
      [email, first_name, last_name, password_hash, theme_id]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error('User registration error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
