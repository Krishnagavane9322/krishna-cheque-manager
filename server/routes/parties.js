const express = require('express');
const Party = require('../models/Party');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all parties for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const parties = await Party.find({ createdBy: req.userId });
    res.json(parties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new party
router.post('/', auth, async (req, res) => {
  try {
    const party = new Party({
      ...req.body,
      createdBy: req.userId
    });
    const newParty = await party.save();
    res.status(201).json(newParty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a party
router.put('/:id', auth, async (req, res) => {
  try {
    const party = await Party.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      req.body,
      { new: true }
    );
    if (!party) return res.status(404).json({ message: 'Party not found' });
    res.json(party);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a party
router.delete('/:id', auth, async (req, res) => {
  try {
    const party = await Party.findOneAndDelete({ _id: req.params.id, createdBy: req.userId });
    if (!party) return res.status(404).json({ message: 'Party not found' });
    res.json({ message: 'Party deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
