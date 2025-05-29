import express from 'express';
import {
  getCurrentUser,
  getUserById,
  getAllUsers,
  updateUser,
  updateUserSkills,
  updateUserSocialLinks,
  updateUserProfilePicture,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/users/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, getCurrentUser);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', getUserById);

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', protect, admin, getAllUsers);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', protect, updateUser);

// @route   PUT /api/users/:id/skills
// @desc    Update user skills
// @access  Private
router.put('/:id/skills', protect, updateUserSkills);

// @route   PUT /api/users/:id/social
// @desc    Update user social links
// @access  Private
router.put('/:id/social', protect, updateUserSocialLinks);

// @route   PUT /api/users/:id/avatar
// @desc    Update user profile picture
// @access  Private
router.put('/:id/avatar', protect, updateUserProfilePicture);

export default router;