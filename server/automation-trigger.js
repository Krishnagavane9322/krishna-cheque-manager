const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

const { checkAndSendNotifications } = require('./services/smsService');

async function main() {
  console.log('--- Cheque Reminder Automation Trigger ---');
  console.log('Started at:', new Date().toLocaleString());

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Successfully connected to MongoDB.');

    console.log('Running notification check...');
    const results = await checkAndSendNotifications();

    console.log('\n--- Execution Summary ---');
    console.log(`Total Pending Cheques Processed: ${results.total}`);
    console.log(`SMS Notifications Sent: ${results.sent}`);
    
    if (results.errors && results.errors.length > 0) {
      console.log('\n--- Errors Encountered ---');
      results.errors.forEach((err, idx) => console.error(`${idx + 1}. ${err}`));
    }
    console.log('--------------------------\n');

  } catch (err) {
    console.error('\n!!! CRITICAL ERROR !!!');
    console.error(err.message);
    process.exit(1);
  } finally {
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Database connection closed.');
    }
    console.log('Automation process finished.');
    process.exit(0);
  }
}

// Start the script
main();
