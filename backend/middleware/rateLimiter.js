const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many requests. Please try again later.',
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many upload attempts. Please try again later.',
});

const fileInfoRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many requests. Please try again later.',
});

const fileAccessRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many file access attempts. Please try again later.',
});

module.exports = { apiLimiter, uploadLimiter, fileInfoRateLimiter, fileAccessRateLimiter };
