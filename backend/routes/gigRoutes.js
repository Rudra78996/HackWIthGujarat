import express from 'express';
const router = express.Router();

// Get all gigs
router.get('/', async (req, res) => {
  try {
    res.status(200).json({ message: 'Get all gigs route' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single gig
router.get('/:id', async (req, res) => {
  try {
    res.status(200).json({ message: `Get gig ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create gig
router.post('/', async (req, res) => {
  try {
    res.status(201).json({ message: 'Create gig route' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update gig
router.put('/:id', async (req, res) => {
  try {
    res.status(200).json({ message: `Update gig ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete gig
router.delete('/:id', async (req, res) => {
  try {
    res.status(200).json({ message: `Delete gig ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 