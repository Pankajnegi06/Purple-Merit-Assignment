const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Profile routes (any authenticated user)
router.get('/profile/me', userController.getMyProfile);
router.put(
  '/profile/me',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validate,
  userController.updateMyProfile
);

// User list (Admin & Manager)
router.get('/', authorize('user:list'), userController.getUsers);

// Get user by ID (Admin & Manager)
router.get('/:id', authorize('user:read'), userController.getUserById);

// Create user (Admin only)
router.post(
  '/',
  authorize('user:create'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'manager', 'user']).withMessage('Invalid role'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
  ],
  validate,
  userController.createUser
);

// Update user (Admin & Manager, with restrictions)
router.put(
  '/:id',
  authorize('user:update'),
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'manager', 'user']).withMessage('Invalid role'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
  ],
  validate,
  userController.updateUser
);

// Delete (deactivate) user (Admin only)
router.delete('/:id', authorize('user:delete'), userController.deleteUser);

module.exports = router;
