const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const pool = require('../db/connection');

router.get('/me', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, email, theme_palette FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];
    res.json({
      id: user.id,
      email: user.email,
      theme: user.theme_palette,
    });
  } catch (err) {
    console.error('User fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
