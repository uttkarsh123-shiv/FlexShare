require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
    
    if (!process.env.MONGO_URI || process.env.MONGO_URI === 'skip') {
      console.log('❌ MongoDB URI not configured');
      return;
    }
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connection successful!');
    
    // Test a simple operation
    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
    console.log('✅ Database write operation successful!');
    
    await mongoose.disconnect();
    console.log('✅ Disconnected successfully');
    
  } catch (error) {
    console.log('❌ MongoDB connection failed:');
    console.log('Error:', error.message);
    console.log('Code:', error.code);
    
    if (error.message.includes('authentication failed')) {
      console.log('💡 Suggestion: Check your username and password');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Suggestion: Check your cluster URL');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Suggestion: Check your network connection and IP whitelist');
    }
  }
}

testConnection();