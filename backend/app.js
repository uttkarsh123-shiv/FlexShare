const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const useRoutes = require('./route/upload.route');
const getFileRoutes = require('./route/getfile.route');
const multer = require('multer');
const helmet = require('helmet');
const app = express();
const cors = require('cors');
const { apiLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://flex-share.vercel.app',
  'https://flexshare-frontend.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
].filter(Boolean);

// Basic optimizations
app.use(compression()); // Compress all responses

// Environment-based logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}


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
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all API routes
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  apiLimiter(req, res, next);
});

// Basic caching headers for file info
app.use('/api/file', (req, res, next) => {
  if (req.method === 'GET' && req.path.includes('/info')) {
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache
  }
  next();
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
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  logger.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false,
        message: 'File too large. Maximum size is 10MB.' 
      });
    }
    return res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }
  
  // Custom file type error
  if (err.message === 'Invalid file type. Only images, PDF, and Word documents are allowed.') {
    return res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }
  
  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      success: false,
      message: 'CORS policy violation' 
    });
  }
  
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

module.exports = app;
