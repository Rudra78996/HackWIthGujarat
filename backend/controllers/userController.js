import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Get current user
// @route   GET /api/users/me
// @access  Private
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Handle special case for "me"
  if (userId === 'me') {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    return res.json(user);
  }

  // Handle regular user ID lookup
  const user = await User.findById(userId)
    .select('-password')
    .populate('skills', 'name level');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json(user);
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if user is updating their own profile
  if (user._id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this profile');
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.bio = req.body.bio || user.bio;
  user.title = req.body.title || user.title;
  user.location = req.body.location || user.location;
  user.website = req.body.website || user.website;

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    bio: updatedUser.bio,
    title: updatedUser.title,
    location: updatedUser.location,
    website: updatedUser.website,
  });
});

// @desc    Update user skills
// @route   PUT /api/users/:id/skills
// @access  Private
const updateUserSkills = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if user is updating their own profile
  if (user._id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this profile');
  }

  if (!Array.isArray(req.body.skills)) {
    res.status(400);
    throw new Error('Skills must be an array');
  }

  user.skills = req.body.skills;
  const updatedUser = await user.save();

  res.json(updatedUser);
});

// @desc    Update user social links
// @route   PUT /api/users/:id/social
// @access  Private
const updateUserSocialLinks = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if user is updating their own profile
  if (user._id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this profile');
  }

  user.socialLinks = {
    ...user.socialLinks,
    ...req.body,
  };

  const updatedUser = await user.save();

  res.json(updatedUser);
});

// @desc    Update user profile picture
// @route   PUT /api/users/:id/avatar
// @access  Private
const updateUserProfilePicture = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if user is updating their own profile
  if (user._id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this profile');
  }

  if (!req.body.avatarUrl) {
    res.status(400);
    throw new Error('Avatar URL is required');
  }

  user.avatar = req.body.avatarUrl;
  const updatedUser = await user.save();

  res.json(updatedUser);
});

export {
  getCurrentUser,
  getUserById,
  getAllUsers,
  updateUser,
  updateUserSkills,
  updateUserSocialLinks,
  updateUserProfilePicture,
};