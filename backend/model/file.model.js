const mongoose = require('mongoose');
const logger = require('../utils/logger');

const fileSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    originalFileName: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    conversionType: {
        type: String,
        enum: [
            'image->png',
            'image->jpg',
            'image->jpeg',
            'image->webp',
            'image->gif',
            'image->bmp',
            'image->avif',
            'image->pdf',
            'pdf->word',
            'word->pdf',
            'pdf->txt',
            'word->txt',
            'excel->pdf',
            'excel->csv',
            'ppt->pdf',
            'none'
        ]
    },
    expiry: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        default: 'No description provided',
        maxlength: 500
    },
    password: {
        type: String,
        default: null,
        select: false // Don't return password by default
    },
    hasPassword: {
        type: Boolean,
        default: false
    },
    maxDownloads: {
        type: Number,
        default: null,
        min: 1,
        max: 100
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    // Access logging for security and analytics
    accessLogs: [{
        ip: String,
        userAgent: String,
        accessedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// Add indexes for better query performance
fileSchema.index({ code: 1 }); // Primary lookup field
fileSchema.index({ expiry: 1 }); // For cleanup queries and TTL
fileSchema.index({ createdAt: -1 }); // For sorting by creation date
fileSchema.index({ downloadCount: 1 }); // For analytics
fileSchema.index({ hasPassword: 1 }); // For filtering protected files

// TTL index for automatic document expiration
fileSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 });

// Dynamic model selection based on environment and connection status
function getFileModel() {
    // If explicitly set to skip MongoDB, use memory storage
    if (process.env.MONGO_URI === 'skip') {
        const memoryStorage = require('../storage/memory');
        return memoryStorage;
    }
    
    // If MongoDB is connected, use MongoDB model
    if (mongoose.connection.readyState === 1) {
        return mongoose.model('File', fileSchema);
    }
    
    // If MongoDB connection is in progress or failed, use memory storage as fallback
    logger.log('MongoDB not ready, using memory storage as fallback');
    const memoryStorage = require('../storage/memory');
    return memoryStorage;
}

// Create a proxy object that dynamically selects the appropriate model
const fileModelProxy = {
    create: async (data) => {
        const model = getFileModel();
        return await model.create(data);
    },
    
    findOne: (query) => {
        const model = getFileModel();
        return model.findOne(query);
    },
    
    updateOne: async (query, update) => {
        const model = getFileModel();
        return await model.updateOne(query, update);
    },
    
    deleteOne: async (query) => {
        const model = getFileModel();
        return await model.deleteOne(query);
    }
};

module.exports = fileModelProxy;