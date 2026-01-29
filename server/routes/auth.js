const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSMS } = require('../services/smsService');
const router = express.Router();

// Register Admin
router.post('/register', async (req, res) => {
  try {
    const { adminId, password, name, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ adminId });
    if (existingUser) {
      return res.status(400).json({ message: 'Admin ID already exists' });
    }

    const user = new User({ adminId, password, name, phoneNumber });
    await user.save();

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login Admin
router.post('/login', async (req, res) => {
  try {
    const { adminId, password } = req.body;

    const user = await User.findOne({ adminId });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user._id,
        adminId: user.adminId,
        name: user.name
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Forgot Password - Send OTP
router.post('/forgot-password', async (req, res) => {
  console.log('--- FORGOT PASSWORD REQUEST ---');
  try {
    const { phoneNumber } = req.body;
    console.log(`Searching for user with phone: ${phoneNumber}`);
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      console.log('User not found with that phone number');
      return res.status(404).json({ message: 'User with this phone number not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated OTP: ${otp} for ${user.adminId}`);
    
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    console.log('OTP saved to database');

    await sendSMS(phoneNumber, `Your OTP for Krishna Nagesh Collection password reset is: ${otp}. Valid for 10 minutes.`);
    console.log('SMS Send command executed');

    res.json({ message: 'OTP sent to your registered mobile number' });
  } catch (err) {
    console.error('FORGOT PASSWORD ERROR:', err);
    res.status(500).json({ message: err.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    const user = await User.findOne({ 
      phoneNumber, 
      resetOTP: otp,
      resetOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Success - return adminId and a temporary token for resetting
    const resetToken = jwt.sign({ userId: user._id, type: 'reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });

    res.json({ 
      adminId: user.adminId,
      resetToken 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    
    // Verify reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (decoded.type !== 'reset') {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password
    user.password = newPassword;
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(400).json({ message: 'Reset link expired or invalid' });
  }
});

module.exports = router;
