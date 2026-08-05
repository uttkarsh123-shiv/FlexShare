const path = require('path');
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
require('dotenv').config({ path: path.join(__dirname, envFile) });

const { connectDB } = require('./config/db.js');
const logger = require('./utils/logger');
const { closeRedisConnection } = require('./queue/redisConnection');

logger.log(`[Worker] Starting — env: ${process.env.NODE_ENV || 'development'}`);
logger.log(`[Worker] env file: ${envFile}`);


async function start() {
  await connectDB();
  logger.log('[Worker] Database connected');

  const worker = require('./queue/conversionWorker');
  logger.log('[Worker] BullMQ worker listening on queue: file-conversion');

  const shutdown = async (signal) => {
    logger.log(`[Worker] ${signal} received — draining in-flight jobs...`);
    try {
      await worker.close();         
      await closeRedisConnection();  
      logger.log('[Worker] Shutdown complete');
    } catch (err) {
      logger.error(`[Worker] Error during shutdown: ${err.message}`);
    }
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error(`[Worker] Unhandled rejection: ${reason}`);
  });
}

start().catch((err) => {
  logger.error(`[Worker] Failed to start: ${err.message}`);
  process.exit(1);
});
