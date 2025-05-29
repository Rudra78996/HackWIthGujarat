import express from 'express';
import { 
  getPosts, 
  getPost, 
  createPost, 
  updatePost, 
  deletePost,
  toggleLike,
  addComment,
  getGroupPosts
} from '../controllers/postController.js';
import { 
  getGroups, 
  getGroup, 
  createGroup, 
  updateGroup, 
  deleteGroup,
  joinGroup,
  leaveGroup 
} from '../controllers/groupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Posts routes
router.get('/posts', getPosts);
router.get('/posts/:id', getPost);
router.post('/posts', protect, createPost);
router.put('/posts/:id', protect, updatePost);
router.delete('/posts/:id', protect, deletePost);
router.post('/posts/:id/like', protect, toggleLike);
router.post('/posts/:id/comments', protect, addComment);

// Groups routes
router.get('/groups', getGroups);
router.get('/groups/:id', getGroup);
router.post('/groups', protect, createGroup);
router.put('/groups/:id', protect, updateGroup);
router.delete('/groups/:id', protect, deleteGroup);
router.post('/groups/:id/join', protect, joinGroup);
router.post('/groups/:id/leave', protect, leaveGroup);
router.get('/groups/:id/posts', getGroupPosts);

export default router; 