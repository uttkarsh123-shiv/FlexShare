const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const useRoutes = require('./route/upload.route');
const getFileRoutes = require('./route/getfile.route');
const helmet = require('helmet');
const app = express();
const cors = require('cors');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
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

// Root route for health checks
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'FlexShare Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      upload: '/api/uploads',
      file: '/api/file/:code'
    }
  });
});

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
  if (req.path === '/health' || req.path=== '/api/health') return next();
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

// Global error handling middleware (must be after routes)
app.use(errorHandler);

module.exports = app;
