const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { runBackup } = require('../services/backupService');

// @route   POST api/admin/backup
// @desc    Manually trigger Google Drive backup
// @access  Private
router.post('/backup', auth, async (req, res) => {
  try {
    // Check if credentials exist
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return res.status(400).json({ 
        message: 'Google Drive credentials are not configured in the system.' 
      });
    }

    // Run backup asynchronously so we don't block the response for too long
    // but we'll await it here to give immediate feedback to the user since it's a manual trigger
    await runBackup();
    
    res.json({ message: 'Backup initiated successfully. Check your Google Drive folder.' });
  } catch (err) {
    console.error('Manual backup error:', err);
    res.status(500).json({ message: 'Failed to initiate backup: ' + err.message });
  }
});

module.exports = router;
