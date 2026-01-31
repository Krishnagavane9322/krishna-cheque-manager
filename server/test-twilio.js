const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from the server directory
dotenv.config({ path: path.join(__dirname, '.env') });

const { sendSMS } = require('./services/smsService');
const User = require('./models/User');

async function testTwilio() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    const user = await User.findOne();
    if (!user || !user.phoneNumber) {
      console.error('No user with a phone number found for testing.');
      process.exit(1);
    }

    console.log(`Sending a TEST Twilio SMS to: ${user.phoneNumber}`);
    const success = await sendSMS(user.phoneNumber, 'Twilio Test: Krishna Cheque Manager integration is working!');
    
    if (success) {
      console.log('✅ SMS Sent Successfully!');
    } else {
      console.log('❌ SMS Failed! Check the logs above.');
    }
  } catch (err) {
    console.error('Test Error:', err);
  } finally {
    mongoose.connection.close();
    process.exit();
  }
}

testTwilio();
