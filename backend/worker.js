const path = require('path');
// On Render env vars are injected directly — skip dotenv if no file exists
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '.env.development') });
}

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

  // Render requires an open port even for worker services on web service plan
  const http = require('http');
  const PORT = process.env.PORT || 3001;
  http.createServer((req, res) => res.end('worker ok')).listen(PORT, () => {
    logger.log(`[Worker] Health port listening on ${PORT}`);
  });

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
