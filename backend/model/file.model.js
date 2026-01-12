const mongoose = require('mongoose');

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
            'pdf->images',
            'word->txt',
            'excel->pdf',
            'excel->csv',
            'ppt->pdf',
            'none'
        ]
    },
    expiry: {
        type: Date,
        required: true,
        index: { expires: 0 }
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
    // Flag to indicate whether the detailed (full) UI view has already been shown
    // This is set once (typically immediately after conversion/upload) so that
    // subsequent visits show a compact/card view instead of the full detailed page.
    firstViewShown: {
        type: Boolean,
        default: false,
        index: true
    },
    accessLogs: [{
        ip: String,
        userAgent: String,
        accessedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

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
    console.log('MongoDB not ready, using memory storage as fallback');
    const memoryStorage = require('../storage/memory');
    return memoryStorage;
}

// Create a proxy object that dynamically selects the appropriate model
const fileModelProxy = {
    create: async (data) => {
        const model = getFileModel();
        return await model.create(data);
    },
    
    findOne: async (query) => {
        const model = getFileModel();
        return await model.findOne(query);
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