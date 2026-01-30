const cron = require('node-cron');
const Cheque = require('../models/Cheque');
const User = require('../models/User');

const axios = require('axios');

// SMS sending function using Fast2SMS
const sendSMS = async (to, message) => {
  try {
    // Clean phone number: Standardize to 10 digits for Indian numbers
    // Remove all non-numeric characters
    let cleanedNumber = to.replace(/\D/g, '');
    
    // If it starts with 91 and is 12 digits, take the last 10
    if (cleanedNumber.length === 12 && cleanedNumber.startsWith('91')) {
      cleanedNumber = cleanedNumber.substring(2);
    }
    
    console.log(`[SMS DEBUG] Attempting to send to: ${cleanedNumber}`);

    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      "route": "q",
      "message": message,
      "language": "english",
      "numbers": cleanedNumber,
    }, {
      headers: {
        "authorization": process.env.FAST2SMS_API_KEY
      }
    });

    // Exhaustive logging for user to check in Render dashboard
    console.log(`[SMS API RESPONSE] Status: ${response.status} - Data:`, JSON.stringify(response.data));

    if (response.data && response.data.return) {
      console.log(`[SMS SUCCESS] TO: ${cleanedNumber}`);
      return true;
    } else {
      console.error(`[SMS FAILURE] TO: ${cleanedNumber} - Message: ${response.data.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    const errorData = error.response?.data || error.message;
    console.error(`[SMS ERROR] TO: ${to} - Details:`, JSON.stringify(errorData));
    return false;
  }
};

const checkAndSendNotifications = async () => {
  console.log('Running scheduled notification check...');
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all pending cheques
    const cheques = await Cheque.find({ status: 'pending' }).populate('partyId').populate('createdBy');

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

      if (daysLeft === 2 && cheque.notificationsSent < 1) {
        await sendSMS(owner.phoneNumber, message);
        cheque.notificationsSent = 1;
        await cheque.save();
      } 
      else if (daysLeft === 1 && cheque.notificationsSent < 2) {
        await sendSMS(owner.phoneNumber, message);
        cheque.notificationsSent = 2;
        await cheque.save();
      } 
      else if (daysLeft === 0 && cheque.notificationsSent < 3) {
        await sendSMS(owner.phoneNumber, `URGENT: ${message}`);
        cheque.notificationsSent = 3;
        await cheque.save();
      }
    }
  } catch (err) {
    console.error('Error in notification service:', err);
  }
};

// Schedule cron jobs
// Runs at 7:00 AM daily
const initCron = () => {
  console.log('Initializing notification cron jobs...');
  
  // 7:00 AM
  cron.schedule('0 7 * * *', () => {
    checkAndSendNotifications();
  });

  // For testing purpose, run once 10 seconds after start
  setTimeout(() => {
    checkAndSendNotifications();
  }, 10000);
};

// Specialized function for sending OTPs (Much cheaper and better delivery)
const sendOTP = async (to, otp) => {
  try {
    let cleanedNumber = to.replace(/\D/g, '');
    if (cleanedNumber.length === 12 && cleanedNumber.startsWith('91')) {
      cleanedNumber = cleanedNumber.substring(2);
    }

    console.log(`[OTP DEBUG] Sending OTP ${otp} to: ${cleanedNumber}`);

    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      "route": "q",
      "message": `Your KNC verification code is: ${otp}`,
      "language": "english",
      "numbers": cleanedNumber,
    }, {
      headers: {
        "authorization": process.env.FAST2SMS_API_KEY
      }
    });

    console.log(`[OTP API RESPONSE] Status: ${response.status} - Data:`, JSON.stringify(response.data));

    if (response.data && response.data.return) {
      console.log(`[OTP SUCCESS] TO: ${cleanedNumber}`);
      return true;
    } else {
      console.error(`[OTP FAILURE] TO: ${cleanedNumber} - Message: ${response.data.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    const errorData = error.response?.data || error.message;
    console.error(`[OTP ERROR] TO: ${to} - Details:`, JSON.stringify(errorData));
    return false;
  }
};

module.exports = { initCron, sendSMS, sendOTP };
