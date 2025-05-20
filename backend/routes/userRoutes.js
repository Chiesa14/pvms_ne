import express from 'express';
import { getCurrentUser, updateProfile, changePassword } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, getCurrentUser);

// @route   PUT /api/users/me
// @desc    Update user profile
// @access  Private
router.put('/me', protect, updateProfile);

// @route   POST /api/users/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', protect, changePassword);

export default router; 