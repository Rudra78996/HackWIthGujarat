import express from 'express';
const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    res.status(200).json({ message: 'Get all events route' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    res.status(200).json({ message: `Get event ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create event
router.post('/', async (req, res) => {
  try {
    res.status(201).json({ message: 'Create event route' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update event
router.put('/:id', async (req, res) => {
  try {
    res.status(200).json({ message: `Update event ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    res.status(200).json({ message: `Delete event ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 