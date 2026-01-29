const express = require('express');
const Cheque = require('../models/Cheque');
const Party = require('../models/Party');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all cheques for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const cheques = await Cheque.find({ createdBy: req.userId }).populate('partyId', 'name');
    res.json(cheques);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new cheque
router.post('/', auth, async (req, res) => {
  try {
    const cheque = new Cheque({
      ...req.body,
      createdBy: req.userId
    });
    const newCheque = await cheque.save();
    await newCheque.populate('partyId', 'name');
    res.status(201).json(newCheque);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a cheque
router.put('/:id', auth, async (req, res) => {
  try {
    const cheque = await Cheque.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      req.body,
      { new: true }
    ).populate('partyId', 'name');
    if (!cheque) return res.status(404).json({ message: 'Cheque not found' });
    res.json(cheque);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a cheque
router.delete('/:id', auth, async (req, res) => {
  try {
    const cheque = await Cheque.findOneAndDelete({ _id: req.params.id, createdBy: req.userId });
    if (!cheque) return res.status(404).json({ message: 'Cheque not found' });
    res.json({ message: 'Cheque deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const totalParties = await Party.countDocuments({ createdBy: userId });
    const totalCheques = await Cheque.countDocuments({ createdBy: userId });
    const pendingDeposits = await Cheque.countDocuments({ createdBy: userId, status: 'pending' });
    const clearedCheques = await Cheque.countDocuments({ createdBy: userId, status: 'cleared' });

    // Recent cheques
    const recentCheques = await Cheque.find({ createdBy: userId })
      .populate('partyId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Upcoming deposits (next 7 days)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const upcomingDeposits = await Cheque.find({
      createdBy: userId,
      status: 'pending',
      depositDate: { $gte: today, $lte: nextWeek }
    }).populate('partyId', 'name').sort({ depositDate: 1 });

    res.json({
      stats: {
        totalParties,
        totalCheques,
        pendingDeposits,
        clearedCheques
      },
      recentCheques,
      upcomingDeposits
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get reminders
router.get('/reminders', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allCheques = await Cheque.find({ createdBy: userId }).populate('partyId', 'name');
    
    const reminders = allCheques.map(cheque => {
      const depositDate = new Date(cheque.depositDate);
      depositDate.setHours(0,0,0,0);
      const diffTime = depositDate - today;
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let status = 'upcoming';
      if (cheque.status === 'cleared') status = 'cleared';
      else if (daysLeft < 0) status = 'overdue';
      else if (daysLeft === 0) status = 'due-today';

      return {
        _id: cheque._id,
        chequeNumber: cheque.chequeNumber,
        partyId: cheque.partyId ? {
          _id: cheque.partyId._id,
          name: cheque.partyId.name
        } : null,
        amount: cheque.amount,
        depositDate: cheque.depositDate,
        daysLeft,
        status
      };
    });

    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
