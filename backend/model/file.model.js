const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    code: {
        type:String,
        required: true,
        unique: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    conversionType:{
        type:String,
        enum: [
            'image->png',
            'image->jpg',
            'image->jpeg',
            'image->webp',
            'pdf->word',
            'word->pdf',
        ]
    },
       expiry: {
        type:Date,
        required:true,
        index: {expires:0}
    },
    description: {
        type: String,
        default: 'file description'
    },
}, {timestamps: true});

const filemodel =  mongoose.model('File', fileSchema);

module.exports = filemodel;