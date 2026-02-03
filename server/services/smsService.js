const cron = require('node-cron');
const Cheque = require('../models/Cheque');
const User = require('../models/User');
const twilio = require('twilio');

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// SMS sending function using Twilio
const sendSMS = async (to, message) => {
  try {
    // Clean phone number: Standardize to E.164 format (e.g., +91XXXXXXXXXX)
    let cleanedNumber = to.replace(/\D/g, '');
    
    // For Indian numbers, prefix with +91 if missing
    if (cleanedNumber.length === 10) {
      cleanedNumber = `+91${cleanedNumber}`;
    } else if (cleanedNumber.length === 12 && cleanedNumber.startsWith('91')) {
      cleanedNumber = `+${cleanedNumber}`;
    } else if (!cleanedNumber.startsWith('+')) {
      // Default fallback for other lengths, adding +
      cleanedNumber = `+${cleanedNumber}`;
    }
    
    console.log(`[SMS DEBUG] Twilio attempting to send to: ${cleanedNumber}`);

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: cleanedNumber
    });

    console.log(`[SMS SUCCESS] SID: ${response.sid} - TO: ${cleanedNumber}`);
    return true;
  } catch (error) {
    console.error(`[SMS ERROR] TO: ${to} - Details:`, error.message);
    return false;
  }
};

const checkAndSendNotifications = async () => {
  console.log('Running scheduled notification check...');
  const results = { total: 0, sent: 0, errors: [] };
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all pending cheques
    const cheques = await Cheque.find({ status: 'pending' }).populate('partyId').populate('createdBy');
    results.total = cheques.length;

    for (const cheque of cheques) {
      const depositDate = new Date(cheque.depositDate);
      depositDate.setHours(0, 0, 0, 0);

      const diffTime = depositDate - today;
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const owner = cheque.createdBy;
      if (!owner || !owner.phoneNumber) continue;

      const message = `Reminder: Cheque #${cheque.chequeNumber} for ₹${cheque.amount.toLocaleString()} from ${cheque.partyId.name} is due for deposit on ${depositDate.toDateString()}.`;

      // Simplified Rules:
      // 2 days before: 1 time
      // 1 day before: 1 time
      // Same day: 1 time (at 7 AM)

      let sent = false;
      if (daysLeft === 2 && cheque.notificationsSent < 1) {
        sent = await sendSMS(owner.phoneNumber, message);
        if (sent) cheque.notificationsSent = 1;
      } 
      else if (daysLeft === 1 && cheque.notificationsSent < 2) {
        sent = await sendSMS(owner.phoneNumber, message);
        if (sent) cheque.notificationsSent = 2;
      } 
      else if (daysLeft === 0 && cheque.notificationsSent < 3) {
        sent = await sendSMS(owner.phoneNumber, `URGENT: ${message}`);
        if (sent) cheque.notificationsSent = 3;
      }

      if (sent) {
        await cheque.save();
        results.sent++;
      }
    }
    return results;
  } catch (err) {
    console.error('Error in notification service:', err);
    results.errors.push(err.message);
    return results;
  }
};

// Schedule cron jobs
// Runs at 7:00 AM daily
const initCron = () => {
  console.log('Initializing notification cron jobs...');
  
  // 7:00 AM
  cron.schedule('0 7 * * *', async () => {
    await checkAndSendNotifications();
  });

  // For testing purpose, run once 10 seconds after start
  setTimeout(async () => {
    await checkAndSendNotifications();
  }, 10000);
};

// Specialized function for sending OTPs using Twilio
const sendOTP = async (to, otp) => {
  const message = `Your KNC verification code is: ${otp}`;
  return await sendSMS(to, message);
};

module.exports = { initCron, sendSMS, sendOTP };
