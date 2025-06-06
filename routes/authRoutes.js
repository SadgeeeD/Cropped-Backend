// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/users/register - User registration
router.post('/register', authController.registerUser);

// POST /api/users/login - User login
router.post('/login', authController.loginUser);

// Example of a protected route (you would add authentication middleware here later)
// router.get('/profile', authMiddleware.verifyToken, userController.getUserProfile);

module.exports = router;