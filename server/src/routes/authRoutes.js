const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  authController.login
);

// Refresh token
router.post('/refresh-token', authController.refreshToken);

// Logout
router.post('/logout', authController.logout);

// Get current user
router.get('/me', authenticate, authController.getMe);

module.exports = router;
