// Load environment variables based on NODE_ENV
const path = require('path');
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
require('dotenv').config({ path: path.join(__dirname, envFile) });

const app = require('./app');
const {connectDB} = require('./config/db.js');
const logger = require('./utils/logger');
const PORT = process.env.PORT || 3000;

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