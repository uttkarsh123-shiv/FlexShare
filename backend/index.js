require('dotenv').config();
const app = require('./app');
const {connectDB} = require('./config/db.js');
const logger = require('./utils/logger');
const PORT = process.env.PORT || 3000;

connectDB().then(()=> {
    app.listen(PORT, () => {
        logger.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    logger.error("Failed to connect to the database", err);
    process.exit(1);
})