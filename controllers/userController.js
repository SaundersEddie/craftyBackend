const pool = require('../db/connection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Register
exports.register = async (req, res) => {
  const { email, password, first_name, last_name, theme_id } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, theme_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email`,
      [email, hashedPassword, first_name, last_name, theme_id]
    );
    res.status(201).json({ message: 'User registered', user: result.rows[0] });
  } catch (err) {
    console.error('❌ Register Error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ user_id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        theme_id: user.theme_id,
      },
    });
  } catch (err) {
    console.error('❌ Login Error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Me
exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, theme_id FROM users WHERE id = $1',
      [req.user.user_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Get Me Error:', err);
    res.status(500).json({ error: 'User lookup failed' });
  }
};

// themes
exports.updateTheme = async (req, res) => {
  const userId = req.user?.user_id;
//   const { theme_palette } = req.body;
  const theme_palette = req.body.theme?.charAt(0).toUpperCase() + req.body.theme?.slice(1);
  console.log(req.body, userId);

  if (!userId || !theme_palette) {
    return res.status(400).json({ error: "Missing user or theme_palette" });
  }

  try {
    const themeResult = await pool.query(
    //   "SELECT id FROM themes WHERE name = $1",
    "SELECT id FROM themes WHERE LOWER(name) = LOWER($1)",
      [theme_palette]
    );

    if (themeResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid theme_palette" });
    }

    const themeId = themeResult.rows[0].id;

    const updateResult = await pool.query(
      "UPDATE users SET theme_id = $1 WHERE id = $2 RETURNING id, email",
      [themeId, userId]
    );

    res.status(200).json({
      message: "Theme updated",
      user: updateResult.rows[0],
      new_theme: theme_palette,
    });
  } catch (err) {
    console.error("❌ Theme Update Error:", err);
    res.status(500).json({ error: "Database update failed" });
  }
};
