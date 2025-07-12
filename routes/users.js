// routes/users.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');

// Registration
router.post('/register', userController.register);

// Login
router.post('/login', userController.login);

// Get logged-in user
router.get('/me', authenticateToken, userController.getMe);

//themes
router.put('/theme', authenticateToken, userController.updateTheme);

module.exports = router;
