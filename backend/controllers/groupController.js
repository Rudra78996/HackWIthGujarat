import Group from '../models/Group.js';

// Get all groups
export const getGroups = async (req, res) => {
  try {
    console.log('Fetching all groups...');
    const groups = await Group.find()
      .populate('creator', 'name')
      .populate('members.user', 'name')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${groups.length} groups`);
    res.json(groups);
  } catch (error) {
    console.error('Error in getGroups:', error);
    res.status(500).json({ 
      message: 'Error fetching groups', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get single group
export const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'name')
      .populate('members.user', 'name');
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching group', error: error.message });
  }
};

// Create group
export const createGroup = async (req, res) => {
  try {
    console.log('Creating group with data:', req.body);
    console.log('User:', req.user);
    
    const { name, description, category, isPrivate } = req.body;
    
    // Validate required fields
    if (!name || !description || !category) {
      console.log('Missing required fields:', { name, description, category });
      return res.status(400).json({ 
        message: 'Name, description, and category are required',
        received: { name, description, category }
      });
    }

    // Validate category
    const validCategories = [
      'Web Development',
      'Mobile Development',
      'UI/UX Design',
      'Data Science',
      'DevOps',
      'Blockchain',
      'Career',
      'Open Source',
      'Other'
    ];

    if (!validCategories.includes(category)) {
      console.log('Invalid category:', category);
      return res.status(400).json({
        message: 'Invalid category',
        received: category,
        validCategories
      });
    }

    // Create new group
    const group = new Group({
      name,
      description,
      category,
      isPrivate: isPrivate === 'true',
      creator: req.user._id
    });

    // Save group
    const savedGroup = await group.save();
    console.log('Group created successfully:', savedGroup);

    // Populate creator and members data
    const populatedGroup = await Group.findById(savedGroup._id)
      .populate('creator', 'name')
      .populate('members.user', 'name');

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error('Error in createGroup:', error);
    res.status(500).json({ 
      message: 'Error creating group', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update group
export const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is the creator or an admin
    const isAdmin = group.members.some(member => 
      member.user.toString() === req.user._id.toString() && 
      member.role === 'admin'
    );
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this group' });
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('creator', 'name')
     .populate('members.user', 'name');
    
    res.json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Error updating group', error: error.message });
  }
};

// Delete group
export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is the creator
    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this group' });
    }

    await group.deleteOne();
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting group', error: error.message });
  }
};

// Join group
export const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is already a member
    const isMember = group.members.some(member => member.user.toString() === req.user._id.toString());
    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }

    // If group is private, create a membership request
    if (group.isPrivate) {
      group.membershipRequests.push({
        user: req.user._id,
        status: 'pending'
      });
      await group.save();
      return res.json({ message: 'Membership request sent' });
    }

    // For public groups, add user directly
    group.members.push({
      user: req.user._id,
      role: 'member'
    });
    await group.save();
    
    res.json({ message: 'Successfully joined the group' });
  } catch (error) {
    res.status(500).json({ message: 'Error joining group', error: error.message });
  }
};

// Leave group
export const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    const memberIndex = group.members.findIndex(
      member => member.user.toString() === req.user._id.toString()
    );
    
    if (memberIndex === -1) {
      return res.status(400).json({ message: 'Not a member of this group' });
    }

    // Creator cannot leave the group
    if (group.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Creator cannot leave the group' });
    }

    // Remove user from members array
    group.members.splice(memberIndex, 1);
    await group.save();
    
    res.json({ message: 'Successfully left the group' });
  } catch (error) {
    res.status(500).json({ message: 'Error leaving group', error: error.message });
  }
}; 