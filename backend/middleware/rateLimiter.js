const rateLimit = require('express-rate-limit');

// Set DISABLE_RATE_LIMIT=true in .env to bypass limits during local k6 testing
const bypass = (req, res, next) => next();
const disabled = process.env.DISABLE_RATE_LIMIT === 'true';
const limit = (opts) => disabled ? bypass : rateLimit(opts);

const apiLimiter = limit({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many requests. Please try again later.',
});

const uploadLimiter = limit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many upload attempts. Please try again later.',
});

const fileInfoRateLimiter = limit({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many requests. Please try again later.',
});

const fileAccessRateLimiter = limit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many file access attempts. Please try again later.',
});

module.exports = { apiLimiter, uploadLimiter, fileInfoRateLimiter, fileAccessRateLimiter };
