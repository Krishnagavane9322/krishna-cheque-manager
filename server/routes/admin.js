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

// @route   GET api/admin/trigger-notifications
// @desc    Trigger automated notifications via external cron
// @access  Public (Secret Protected)
router.get('/trigger-notifications', async (req, res) => {
  try {
    const { secret } = req.query;
    const CRON_SECRET = process.env.CRON_SECRET || 'knc_reminder_secret_2026';

    if (secret !== CRON_SECRET) {
      console.warn(`[UNAUTHORIZED CRON ATTEMPT] Invalid secret from IP: ${req.ip}`);
      return res.status(401).json({ message: 'Unauthorized: Invalid secret' });
    }

    const { checkAndSendNotifications } = require('../services/smsService');
    
    // Run it asynchronously
    checkAndSendNotifications()
      .then(() => console.log('[CRON TRIGGER] Successfully completed notification check'))
      .catch((err) => console.error('[CRON TRIGGER] Error in notification check:', err));

    res.json({ message: 'Notification check triggered successfully' });
  } catch (err) {
    console.error('Trigger notifications error:', err);
    res.status(500).json({ message: 'Failed to trigger notifications: ' + err.message });
  }
});

module.exports = router;
