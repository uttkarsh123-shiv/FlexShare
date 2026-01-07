const mongoose = require('mongoose');

const connectDB = async ()=> {
    try{
        if (process.env.MONGO_URI) {
            console.log('Attempting to connect to MongoDB...');
            
            await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 15000, // Increase timeout to 15s
                socketTimeoutMS: 45000,
                maxPoolSize: 10,
                minPoolSize: 5,
                maxIdleTimeMS: 30000,
                retryWrites: true,
                w: 'majority'
            });
            
            console.log("✅ Database connected successfully");
            
            // Test the connection with a simple operation
            await mongoose.connection.db.admin().ping();
            console.log("✅ Database ping successful");
            
        } else {
            console.log("Database connection skipped for development");
        }
    }
    catch(error){
        console.error("❌ Database connection failed:");
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        
        if (error.message.includes('authentication failed')) {
            console.error("🔑 Authentication issue - check username/password");
            console.error("💡 Make sure the database user exists and has proper permissions");
        } else if (error.message.includes('ENOTFOUND')) {
            console.error("🌐 Network issue - check cluster URL");
        } else if (error.message.includes('timeout')) {
            console.error("⏰ Connection timeout - check network and IP whitelist");
            console.error("💡 Make sure your IP is whitelisted in MongoDB Atlas");
        }
        
        // Don't exit in development, continue with memory storage
        if (process.env.NODE_ENV !== 'production') {
            console.log("🔄 Continuing with in-memory storage for development...");
        } else {
            console.log("🔄 Retrying database connection in 10 seconds...");
            setTimeout(connectDB, 10000);
        }
    }
}

module.exports = { connectDB };