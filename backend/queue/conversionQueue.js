const { Queue } = require('bullmq');
const { getRedisConnection } = require('./redisConnection');

const conversionQueue = new Queue('file-conversion', {
  connection: getRedisConnection(),
  defaultJobOptions: {
    attempts: 3,                
    backoff: { type: 'exponential', delay: 2000 }, 
    removeOnComplete: { age: 3600 }, 
    removeOnFail: { age: 86400 },  
  },
});

module.exports = conversionQueue;
