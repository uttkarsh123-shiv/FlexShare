const path = require('path');
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
require('dotenv').config({ path: path.join(__dirname, envFile) });

const app = require('./app');
const { connectDB } = require('./config/db.js');
const logger = require('./utils/logger');
const { startCleanupCron } = require('./utils/s3Cleanup');

const PORT = process.env.PORT || 3000;

logger.log(`Loading environment: ${process.env.NODE_ENV || 'development'}`);
logger.log(`Environment file: ${envFile}`);

const gracefulShutdown = (signal) => {
  logger.log(`[Server] ${signal} received — shutting down`);
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.log(`[Server] API running on port ${PORT}`);
    });
    startCleanupCron();
  })
  .catch((err) => {
    logger.error('[Server] Failed to connect to database', err);
    process.exit(1);
  });
