import express from 'express';
import Gig from '../models/gigModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all gigs
router.get('/', async (req, res) => {
  try {
    const gigs = await Gig.find()
      .populate('postedBy', 'name profilePicture')
      .sort({ createdAt: -1 });
    res.status(200).json(gigs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's applications
router.get('/my-applications', protect, async (req, res) => {
  try {
    const gigs = await Gig.find({
      'applications.user': req.user._id
    }).populate('postedBy', 'name email');

    // Format the response to include application details
    const applications = gigs.map(gig => {
      const application = gig.applications.find(app => app.user.toString() === req.user._id.toString());
      return {
        _id: application._id,
        gig: {
          _id: gig._id,
          title: gig.title,
          description: gig.description,
          budget: gig.budget,
          duration: gig.duration,
          location: gig.location,
          status: gig.status
        },
        coverLetter: application.coverLetter,
        proposedBudget: application.proposedBudget,
        status: application.status,
        submittedAt: application.submittedAt
      };
    });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user's posted gigs
router.get('/my-gigs', protect, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      console.error('User not found in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log("Getting user's posted gigs for user:", req.user._id);
    
    const gigs = await Gig.find({ postedBy: req.user._id })
      .populate('applications.user', 'name profilePicture')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${gigs.length} gigs for user`);
    return res.status(200).json(gigs);
  } catch (error) {
    console.error('Error in /my-gigs route:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch gigs',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get single gig
router.get('/:id', async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('postedBy', 'name profilePicture')
      .populate('applications.user', 'name profilePicture');
    
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    
    res.status(200).json(gig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create gig
router.post('/create', protect, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      skills,
      budget,
      duration,
      deadline,
      location,
      experience
    } = req.body;

    const gig = await Gig.create({
      title,
      description,
      category,
      skills,
      budget,
      duration,
      deadline,
      location,
      experience,
      postedBy: req.user._id
    });

    const populatedGig = await Gig.findById(gig._id)
      .populate('postedBy', 'name profilePicture');
    await populatedGig.save();
    res.status(201).json(populatedGig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update gig
router.put('/:id', protect, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Check if user is the gig owner
    if (gig.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this gig' });
    }

    const updatedGig = await Gig.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('postedBy', 'name profilePicture');

    res.status(200).json(updatedGig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete gig
router.delete('/:id', protect, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Check if user is the gig owner
    if (gig.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this gig' });
    }

    await gig.deleteOne();
    res.status(200).json({ message: 'Gig deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Apply for gig
router.post('/:id/apply', protect, async (req, res) => {
  try {
    const { coverLetter, proposedBudget } = req.body;
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Check if user has already applied
    const hasApplied = gig.applications.some(
      app => app.user.toString() === req.user._id.toString()
    );

    if (hasApplied) {
      return res.status(400).json({ message: 'You have already applied for this gig' });
    }

    gig.applications.push({
      user: req.user._id,
      coverLetter,
      proposedBudget
    });

    await gig.save();
    res.status(200).json(gig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update application status
router.put('/:gigId/applications/:applicationId', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const gig = await Gig.findById(req.params.gigId);

    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Check if user is the gig owner
    if (gig.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    const application = gig.applications.id(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // If accepting an application, reject all others
    if (status === 'Accepted') {
      gig.applications.forEach(app => {
        if (app._id.toString() !== req.params.applicationId) {
          app.status = 'Rejected';
        }
      });
    }

    application.status = status;
    await gig.save();

    res.json(gig);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update gig status
router.put('/:gigId/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const gig = await Gig.findById(req.params.gigId);

    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Check if user is the gig owner
    if (gig.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this gig' });
    }

    gig.status = status;
    await gig.save();

    res.json(gig);
  } catch (error) {
    console.error('Error updating gig status:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 