const rateLimit = require('express-rate-limit');

// General API rate limiter - 30 requests per minute
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per window
  message: 'Too many API requests. Please try again later.',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});

// Upload rate limiter - 10 uploads per minute
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many upload attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// File info rate limiter - 2 requests per minute (strict)
const fileInfoRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 2,
  message: 'Too many requests for file info. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// File access rate limiter - 5 downloads per minute
const fileAccessRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many file access attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  uploadLimiter,
  fileInfoRateLimiter,
  fileAccessRateLimiter,
};

