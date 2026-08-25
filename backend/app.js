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

// Trust the first proxy (Nginx) — required when running behind a reverse proxy
// so express-rate-limit and req.ip work correctly with X-Forwarded-For
app.set('trust proxy', 1);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://flex-share.vercel.app',
  'https://flexshare-frontend.vercel.app',
].filter(Boolean);

app.use(compression());

app.use(morgan(':method :url :status :response-time ms', {
  skip: (req) => {
    // suppress noisy bot requests for common files
    const boring = ['/robots.txt', '/favicon.ico', '/favicon', '/security.txt', '/.well-known/robots.txt'];
    return req.method === 'OPTIONS' || boring.includes(req.path);
  }
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

// Silence common bot/browser probes
app.get(['/robots.txt', '/favicon.ico', '/favicon', '/security.txt', '/.well-known/robots.txt'], (req, res) => {
  res.status(204).end();
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

app.use('/api', useRoutes);
app.use('/api', getFileRoutes);

app.use(errorHandler);

module.exports = app;
