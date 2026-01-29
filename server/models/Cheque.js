const mongoose = require('mongoose');

const chequeSchema = new mongoose.Schema({
  chequeNumber: {
    type: String,
    required: true,
    trim: true
  },
  issueDate: {
    type: Date,
    required: true
  },
  partyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  depositDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'deposited', 'cleared'],
    default: 'pending'
  },
  notificationsSent: {
    type: Number,
    default: 0
  },
  clearDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cheque', chequeSchema);
