const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/connection');
const authenticateToken = require('../middleware/auth');
const userController = require('../controllers/userController');

// POST /api/auth/login
router.post('/login', userController.login);

// GET /api/auth/me
router.get('/me', authenticateToken, userController.getMe);

module.exports = router;
