const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async ()=> {
    try{
        if (process.env.MONGO_URI) {
            logger.log('Attempting to connect to MongoDB...');
            
            await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 15000,
                socketTimeoutMS: 45000,
                maxPoolSize: 10,
                minPoolSize: 5,
                maxIdleTimeMS: 30000,
                retryWrites: true,
                w: 'majority'
            });
            
            logger.log("Database connected successfully");
            
            // Test the connection with a simple operation
            await mongoose.connection.db.admin().ping();
            logger.log("Database ping successful");
            
        } else {
            logger.log("Database connection skipped for development");
        }
    }
    catch(error){
        logger.error("Database connection failed:");
        logger.error("Error message:", error.message);
        logger.error("Error code:", error.code);
        
        if (error.message.includes('authentication failed')) {
            logger.error("Authentication issue - check username/password");
            logger.error("Make sure the database user exists and has proper permissions");
        } else if (error.message.includes('ENOTFOUND')) {
            logger.error("Network issue - check cluster URL");
        } else if (error.message.includes('timeout')) {
            logger.error("Connection timeout - check network and IP whitelist");
            logger.error("Make sure your IP is whitelisted in MongoDB Atlas");
        }
        
        // Don't exit in development, continue with memory storage
        if (process.env.NODE_ENV !== 'production') {
            logger.log("Continuing with in-memory storage for development...");
        } else {
            logger.log("Retrying database connection in 10 seconds...");
            setTimeout(connectDB, 10000);
        }
    }
}

module.exports = { connectDB };