import express from 'express';
import Event from '../models/eventModel.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'name')
      .populate('registrations.user', '_id name');
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's events (both organized and registered)
router.get('/my-events', protect, async (req, res) => {
  try {
    // Get events organized by the user
    const organizedEvents = await Event.find({ organizer: req.user._id })
      .populate('organizer', 'name')
      .populate('registrations.user', '_id name');

    // Get events where user is registered
    const registeredEvents = await Event.find({
      'registrations.user': req.user._id,
      'registrations.status': 'Registered'
    })
      .populate('organizer', 'name')
      .populate('registrations.user', '_id name');

    res.status(200).json({
      organized: organizedEvents,
      registered: registeredEvents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name')
      .populate('registrations.user', '_id name');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create event
router.post('/', protect, async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      organizer: req.user._id,
      registrations: [],
      status: 'Published'
    };
    
    const event = await Event.create(eventData);
    const populatedEvent = await Event.findById(event._id)
      .populate('organizer', 'name')
      .populate('registrations.user', '_id name');
    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register for event
router.post('/:id/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is full
    const registeredCount = event.registrations.filter(r => r.status === 'Registered').length;
    if (registeredCount >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if user is already registered
    const isRegistered = event.registrations.some(
      reg => reg.user.toString() === req.user._id.toString() && reg.status === 'Registered'
    );
    if (isRegistered) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Add registration
    event.registrations.push({
      user: req.user._id,
      status: 'Registered',
      registeredAt: new Date()
    });

    await event.save();
    
    // Return populated event
    const populatedEvent = await Event.findById(event._id)
      .populate('organizer', 'name')
      .populate('registrations.user', '_id name');
    res.status(200).json(populatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update event
router.put('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('organizer', 'name')
     .populate('registrations.user', '_id name');
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete event
router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 