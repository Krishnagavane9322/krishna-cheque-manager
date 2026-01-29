const { google } = require('googleapis');
const cron = require('node-cron');
const Cheque = require('../models/Cheque');
const Party = require('../models/Party');
const User = require('../models/User');
const { Readable } = require('stream');

// Google Drive API configuration
const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
  ['https://www.googleapis.com/auth/drive.file']
);

const drive = google.drive({ version: 'v3', auth });

const runBackup = async () => {
  console.log('Starting automated data backup to Google Drive...');
  
  try {
    // 1. Fetch all data from MongoDB
    const [cheques, parties, users] = await Promise.all([
      Cheque.find({}),
      Party.find({}),
      User.find({}, '-password') // Exclude passwords for security
    ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      data: {
        cheques,
        parties,
        users
      }
    };

    const fileName = `KNC_Backup_${new Date().toISOString().split('T')[0]}.json`;
    const content = JSON.stringify(backupData, null, 2);

    // 2. Upload to Google Drive
    // Check if we have credentials
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.warn('[BACKUP SKIP] Google Drive credentials not found in .env');
      return;
    }

    const fileMetadata = {
      name: fileName,
      parents: process.env.GOOGLE_DRIVE_FOLDER_ID ? [process.env.GOOGLE_DRIVE_FOLDER_ID] : []
    };

    const media = {
      mimeType: 'application/json',
      body: Readable.from([content])
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id'
    });

    console.log(`[BACKUP SUCCESS] Data backed up to Google Drive. File ID: ${response.data.id}`);
    
  } catch (err) {
    console.error('[BACKUP ERROR] Failed to perform Google Drive backup:', err.message);
  }
};

const initBackupCron = () => {
  console.log('Initializing backup cron jobs...');
  
  // Schedule to run at 12:00 AM (midnight) every day
  cron.schedule('0 0 * * *', () => {
    runBackup();
  });

  // For testing/initial setup: run backup once after 30 seconds if credentials exist
  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    setTimeout(() => {
      runBackup();
    }, 30000);
  }
};

module.exports = { initBackupCron, runBackup };
