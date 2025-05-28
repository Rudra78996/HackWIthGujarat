import express from 'express';
import { 
  getCurrentUser, 
  getUserById, 
  updateUser, 
  searchUsers 
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes
router.get('/me', protect, getCurrentUser);
router.put('/me', protect, updateUser);

// Public routes
router.get('/search', searchUsers);
router.get('/:id', getUserById);

export default router;