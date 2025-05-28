import User from '../models/userModel.js';

// @desc    Get current user
// @route   GET /api/users/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res) => {
  try {
    // Get user but exclude sensitive fields
    const user = await User.findById(req.params.id).select('-password -email');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/me
// @access  Private
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update allowed fields
    const {
      name,
      bio,
      title,
      location,
      website,
      skills,
      socialLinks,
      profilePicture
    } = req.body;
    
    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (title) user.title = title;
    if (location) user.location = location;
    if (website) user.website = website;
    if (skills) user.skills = skills;
    if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };
    if (profilePicture) user.profilePicture = profilePicture;
    
    const updatedUser = await user.save();
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
export const searchUsers = async (req, res) => {
  try {
    const { query, skills, limit = 10, page = 1 } = req.query;
    
    const searchQuery = {};
    
    // Add text search if query provided
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
        { title: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Add skills filter if provided
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      searchQuery.skills = { $in: skillsArray };
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(searchQuery)
      .select('name title bio skills profilePicture')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });
    
    // Count total results for pagination
    const total = await User.countDocuments(searchQuery);
    
    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: error.message });
  }
};