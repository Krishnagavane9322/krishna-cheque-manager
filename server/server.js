const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Performance Middleware
app.use(helmet()); // Sets various security-related HTTP headers

// Rate limiting to prevent crashes from too many requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api', limiter);

// Middleware
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3000'
  ].filter(Boolean),
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Increase body size limit for large reports
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/parties', require('./routes/parties'));
app.use('/api/cheques', require('./routes/cheques'));
app.use('/api/admin', require('./routes/admin'));

const { initCron } = require('./services/smsService');
const { initBackupCron } = require('./services/backupService');
initCron();
initBackupCron();

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.send('Krishna Cheque Manager API is running...');
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
