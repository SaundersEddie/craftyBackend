// controllers/userController.js

const pool = require('../db/connection');
const jwt  = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Register
exports.register = async (req, res) => {
  const {
    username,
    email,
    password,
    first_name,
    last_name,
    theme_id
  } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email & password are required' });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into users, default role = customer
    const result = await pool.query(
      `INSERT INTO users
         (username, email, password_hash, first_name, last_name, theme_id, role)
       VALUES ($1, $2,     $3,            $4,         $5,        $6,       'customer')
       RETURNING id, username, email, first_name, last_name, theme_id, role`,
      [username, email, hashedPassword, first_name, last_name, theme_id]
    );

    const user = result.rows[0];
    res.status(201).json({
      message: 'User registered',
      user
    });
  } catch (err) {
    console.error('❌ Register Error:', err);

    // Handle unique constraint violations
    if (err.code === '23505') {
      const field = err.detail.match(/\((.+)\)=/)[1];
      return res.status(409).json({ error: `${field} already in use` });
    }

    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  try {
    // Look up by username
    const result = await pool.query(
      `SELECT id, username, password_hash, role, theme_id
         FROM users
       WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT
    const token = jwt.sign(
      {
        user_id: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        theme_id: user.theme_id
      }
    });
  } catch (err) {
    console.error('❌ Login Error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get current user ("me")
exports.getMe = async (req, res) => {
  const userId = req.user?.user_id;
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const result = await pool.query(
      `SELECT id, username, email, first_name, last_name, role, theme_id
         FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Get Me Error:', err);
    res.status(500).json({ error: 'User lookup failed' });
  }
};

// Update theme
exports.updateTheme = async (req, res) => {
  const userId = req.user?.user_id;
  const requested = req.body.theme;
  if (!userId || !requested) {
    return res.status(400).json({ error: 'Missing user or theme' });
  }

  // Normalize theme name (e.g. camel → Title Case)
  const themeName = requested.charAt(0).toUpperCase() + requested.slice(1).toLowerCase();

  try {
    // Find theme ID
    const themeResult = await pool.query(
      `SELECT id FROM themes WHERE LOWER(name) = LOWER($1)`,
      [themeName]
    );

    if (themeResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid theme' });
    }

    const themeId = themeResult.rows[0].id;

    // Update user
    const updateResult = await pool.query(
      `UPDATE users
          SET theme_id = $1
        WHERE id = $2
      RETURNING id, username, theme_id`,
      [themeId, userId]
    );

    const updated = updateResult.rows[0];
    res.json({
      message: 'Theme updated',
      user: updated
    });
  } catch (err) {
    console.error('❌ Theme Update Error:', err);
    res.status(500).json({ error: 'Database update failed' });
  }
};
