const { Redis } = require('ioredis');
const logger = require('../utils/logger');

let redisInstance = null;

const getRedisConnection = () => {
  if (!redisInstance) {
    redisInstance = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: null, 
      enableReadyCheck: false,  
    });

    redisInstance.on('connect', () => logger.log('Redis connected'));
    redisInstance.on('error', (err) => logger.error('Redis error:', err.message));
  }
  return redisInstance;
};

module.exports = { getRedisConnection };
