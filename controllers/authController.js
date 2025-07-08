const bcrypt = require('bcryptjs');
const pool = require('../db/connection');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  const { email, password } = req.body;

  // Basic input checks
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Sanitize and validate email
  const sanitizedEmail = validator.normalizeEmail(email);
  if (!validator.isEmail(sanitizedEmail)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  // Validate password length
  if (!validator.isLength(password, { min: 8 })) {
    return res
      .status(400)
      .json({ error: 'Password must be at least 8 characters long.' });
  }

  try {
    // Check if email is already registered
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [sanitizedEmail]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [sanitizedEmail, hashedPassword]
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertId,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const sanitizedEmail = validator.normalizeEmail(email);

  try {
    const [users] = await pool.query(
      'SELECT id, email, password_hash FROM users WHERE email = ?',
      [sanitizedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Option 1: Return token in body
    return res.json({ token });

    // Option 2: Return token in HTTP-only cookie (safer for production)
    /*
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 86400000, // 1 day
    });
    return res.json({ message: "Logged in successfully" });
    */
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { registerUser, loginUser };
