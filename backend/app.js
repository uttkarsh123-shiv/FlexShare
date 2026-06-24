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
].filter(Boolean);

app.use(compression()); 

morgan.token('short-status', (req, res) => res.statusCode);
app.use(morgan(':method :url :status :response-time ms', {
  skip: (req) => req.method === 'OPTIONS'
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? allowedOrigins : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

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

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api', (req, res, next) => {
  if (req.path === '/health' || req.path=== '/api/health') return next();
  apiLimiter(req, res, next);
});

app.use('/api/file', (req, res, next) => {
  if (req.method === 'GET' && req.path.includes('/info')) {
    res.set('Cache-Control', 'public, max-age=300'); 
  }
  next();
});

app.use('/api', useRoutes);
app.use('/api', getFileRoutes);

app.use(errorHandler);

module.exports = app;
