const path = require('path');
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
require('dotenv').config({ path: path.join(__dirname, envFile) });

const app = require('./app');
const {connectDB} = require('./config/db.js');
const logger = require('./utils/logger');
const PORT = process.env.PORT || 3000;

async function startWorker() {
  try {
    const { Redis } = require('ioredis');
    const testConn = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      connectTimeout: 3000,
      lazyConnect: true,
    });
    await testConn.connect();
    await testConn.quit();
    require('./queue/conversionWorker');
    logger.log('Conversion worker started');
  } catch (err) {
    logger.warn(`Redis not available (${err.message}) — conversion worker disabled. File conversion jobs will not be processed until Redis is running.`);
  }
}

startWorker();

logger.log(`Loading environment: ${process.env.NODE_ENV || 'development'}`);
logger.log(`Environment file: ${envFile}`);

connectDB().then(()=> {
    app.listen(PORT, () => {
        logger.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    logger.error("Failed to connect to the database", err);
    process.exit(1);
})