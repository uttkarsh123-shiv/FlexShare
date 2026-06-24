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
        default: ''
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
        required: true,
    },
    description: {
        type: String,
        default: 'No description provided',
        maxlength: 500
    },
    password: {
        type: String,
        default: null,
        select: false 
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
    status: {
        type: String,
        enum: ['pending', 'processing', 'done', 'failed'],
        default: 'done' 
    },
    jobId: {
        type: String,
        default: null
    },

    accessLogs: [{
        ip: String,
        userAgent: String,
        accessedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

fileSchema.index({ createdAt: -1 }); 
fileSchema.index({ downloadCount: 1 });
fileSchema.index({ hasPassword: 1 }); 

fileSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 });

function getFileModel() {
    if (process.env.MONGO_URI === 'skip') {
        const memoryStorage = require('../storage/memory');
        return memoryStorage;
    }
    
    if (mongoose.connection.readyState === 1) {
        return mongoose.model('File', fileSchema);
    }
    
    logger.log('MongoDB not ready, using memory storage as fallback');
    const memoryStorage = require('../storage/memory');
    return memoryStorage;
}

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
    },

    findByIdAndUpdate: async (id, update) => {
        const model = getFileModel();
        if (model.findByIdAndUpdate) return await model.findByIdAndUpdate(id, update);
        return await model.updateOne({ _id: id }, update);
    },

    findById: async (id) => {
        const model = getFileModel();
        if (model.findById) return await model.findById(id);
        return await model.findOne({ _id: id });
    }
};

module.exports = fileModelProxy;