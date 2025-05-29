import express from 'express';
import { chatWithAI } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected route for AI chat
router.post('/chat', protect, chatWithAI);

export default router; 