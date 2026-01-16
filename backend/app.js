const express = require('express');
const useRoutes = require('./route/upload.route');
const getFileRoutes = require('./route/getfile.route');
const multer = require('multer');
const helmet = require('helmet');
const app = express();
const cors = require('cors');
const { apiLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');


// Allow both production and local development
const allowedOrigins = [
  'https://flex-share.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Apply rate limiting to all API routes

app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  apiLimiter(req, res, next);
});

// Add request logging middleware
app.use('/api', (req, res, next) => {
  logger.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  logger.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    logger.log('Body:', req.body);
  }
  next();
});

app.use('/api', useRoutes);
app.use('/api', getFileRoutes);

// Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'OK', 
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// Error handling middleware (must be after routes)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 50MB.' });
    }
    return res.status(400).json({ message: err.message });
  }
  
  if (err.message === 'Invalid file type. Only images, PDF, and Word documents are allowed.') {
    return res.status(400).json({ message: err.message });
  }
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS policy violation' });
  }
  
  logger.error('Error:', err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

module.exports = app;
