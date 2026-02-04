const logger = require('../utils/logger');

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map();

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  fileInfo: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 2, // 2 requests per minute
    message: 'Too many requests for file info. Please try again later.'
  },
  fileAccess: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 requests per minute
    message: 'Too many file access attempts. Please try again later.'
  }
};

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.resetTime > 0) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

const createRateLimiter = (type) => {
  const config = RATE_LIMIT_CONFIG[type];
  
  if (!config) {
    throw new Error(`Invalid rate limiter type: ${type}`);
  }

  return (req, res, next) => {
    try {
      // Create a unique key based on IP and endpoint
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      const key = `${type}:${clientIp}`;
      const now = Date.now();

      // Get or create rate limit data for this client
      let rateLimitData = rateLimitStore.get(key);
      
      if (!rateLimitData || now > rateLimitData.resetTime) {
        // Create new window
        rateLimitData = {
          count: 0,
          resetTime: now + config.windowMs,
          firstRequest: now
        };
        logger.info(`New rate limit window created for ${key}`);
      }

      // Increment request count
      rateLimitData.count++;
      rateLimitStore.set(key, rateLimitData);

      logger.info(`Rate limit check for ${key}: ${rateLimitData.count}/${config.maxRequests}`);

      // Check if limit exceeded
      if (rateLimitData.count > config.maxRequests) {
        const timeUntilReset = Math.ceil((rateLimitData.resetTime - now) / 1000);
        
        logger.warn(`Rate limit exceeded for ${clientIp} on ${type}. Count: ${rateLimitData.count}, Reset in: ${timeUntilReset}s`);
        
        return res.status(429).json({
          message: config.message,
          retryAfter: timeUntilReset,
          limit: config.maxRequests,
          remaining: 0,
          resetTime: rateLimitData.resetTime
        });
      }

      // Add rate limit headers
      const remaining = Math.max(0, config.maxRequests - rateLimitData.count);
      res.set({
        'X-RateLimit-Limit': config.maxRequests,
        'X-RateLimit-Remaining': remaining,
        'X-RateLimit-Reset': Math.ceil(rateLimitData.resetTime / 1000)
      });

      logger.info(`Rate limit headers set: ${remaining} remaining`);
      next();
    } catch (error) {
      logger.error('Rate limiter error:', error);
      // Don't block requests if rate limiter fails
      next();
    }
  };
};

// Export specific rate limiters
const fileInfoRateLimiter = createRateLimiter('fileInfo');
const fileAccessRateLimiter = createRateLimiter('fileAccess');

// Create upload-specific rate limiter (more permissive for uploads)
const uploadLimiter = (req, res, next) => {
  // For uploads, we'll use a more permissive rate limit
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const key = `upload:${clientIp}`;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10; // 10 uploads per minute

  let rateLimitData = rateLimitStore.get(key);
  
  if (!rateLimitData || now > rateLimitData.resetTime) {
    rateLimitData = {
      count: 0,
      resetTime: now + windowMs,
      firstRequest: now
    };
  }

  rateLimitData.count++;
  rateLimitStore.set(key, rateLimitData);

  if (rateLimitData.count > maxRequests) {
    const timeUntilReset = Math.ceil((rateLimitData.resetTime - now) / 1000);
    return res.status(429).json({
      message: 'Too many upload attempts. Please try again later.',
      retryAfter: timeUntilReset
    });
  }

  next();
};

// Create general API rate limiter
const apiLimiter = (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const key = `api:${clientIp}`;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 30; // 30 API calls per minute

  let rateLimitData = rateLimitStore.get(key);
  
  if (!rateLimitData || now > rateLimitData.resetTime) {
    rateLimitData = {
      count: 0,
      resetTime: now + windowMs,
      firstRequest: now
    };
  }

  rateLimitData.count++;
  rateLimitStore.set(key, rateLimitData);

  if (rateLimitData.count > maxRequests) {
    const timeUntilReset = Math.ceil((rateLimitData.resetTime - now) / 1000);
    return res.status(429).json({
      message: 'Too many API requests. Please try again later.',
      retryAfter: timeUntilReset
    });
  }

  next();
};

module.exports = {
  fileInfoRateLimiter,
  fileAccessRateLimiter,
  uploadLimiter,
  apiLimiter,
  createRateLimiter
};

