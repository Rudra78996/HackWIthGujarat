import Post from '../models/Post.js';
import Group from '../models/Group.js';

// Get all posts
export const getPosts = async (req, res) => {
  try {
    console.log('Fetching all posts...');
    const posts = await Post.find()
      .populate('author', 'name')
      .populate('comments.author', 'name')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${posts.length} posts`);
    res.json(posts);
  } catch (error) {
    console.error('Error in getPosts:', error);
    res.status(500).json({ 
      message: 'Error fetching posts', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get posts for a specific group
export const getGroupPosts = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const posts = await Post.find({ group: req.params.id })
      .populate('author', 'name')
      .populate('comments.author', 'name')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Error in getGroupPosts:', error);
    res.status(500).json({ 
      message: 'Error fetching group posts', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get single post
export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name')
      .populate('comments.author', 'name');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
};

// Create post
export const createPost = async (req, res) => {
  try {
    const { title, content, image, groupId } = req.body;
    
    // Validate required fields
    if (!title || !content || !groupId) {
      return res.status(400).json({ 
        message: 'Title, content, and groupId are required',
        received: { title, content, groupId }
      });
    }

    // Check if group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const post = new Post({
      title,
      content,
      image,
      author: req.user._id,
      group: groupId
    });

    await post.save();

    // Add post to group's posts array
    group.posts.push(post._id);
    await group.save();

    // Populate author and group data
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name')
      .populate('group', 'name');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error in createPost:', error);
    res.status(500).json({ 
      message: 'Error creating post', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
};

// Like/Unlike post
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userIndex = post.likedBy.indexOf(req.user._id);
    if (userIndex === -1) {
      // Like the post
      post.likedBy.push(req.user._id);
      post.likes += 1;
    } else {
      // Unlike the post
      post.likedBy.splice(userIndex, 1);
      post.likes -= 1;
    }

    await post.save();
    
    // Populate the post data before sending response
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name')
      .populate('comments.author', 'name');
      
    res.json(populatedPost);
  } catch (error) {
    console.error('Error in toggleLike:', error);
    res.status(500).json({ 
      message: 'Error toggling like', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Add comment
export const addComment = async (req, res) => {
  try {
    console.log('Adding comment to post:', req.params.id);
    console.log('Request body:', req.body);
    console.log('User:', req.user);

    const { content } = req.body;
    
    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      console.log('Invalid content:', content);
      return res.status(400).json({ message: 'Comment content is required' });
    }

    // Validate post ID
    if (!req.params.id) {
      console.log('Missing post ID');
      return res.status(400).json({ message: 'Post ID is required' });
    }

    // Validate user
    if (!req.user || !req.user._id) {
      console.log('Missing user or user ID');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Create the comment object
    const newComment = {
      content: content.trim(),
      author: req.user._id
    };

    console.log('Adding new comment:', newComment);
    
    // Use findOneAndUpdate with $push to add the comment
    const updatedPost = await Post.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { comments: newComment } },
      { 
        new: true,
        runValidators: true
      }
    )
    .populate('author', 'name')
    .populate('comments.author', 'name')
    .sort({ 'comments.createdAt': -1 });
    
    if (!updatedPost) {
      console.log('Post not found:', req.params.id);
      return res.status(404).json({ message: 'Post not found' });
    }

    console.log('Comment added successfully');
    res.json(updatedPost);
  } catch (error) {
    console.error('Error in addComment:', error);
    res.status(500).json({ 
      message: 'Error adding comment', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}; 