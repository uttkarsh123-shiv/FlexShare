// import multer, { diskStorage } from 'multer';
// import { extname } from 'path';

const multer = require('multer');
const { diskStorage } = require('multer');
const { extname } = require('path');
const logger = require('../utils/logger');

const storage = diskStorage({
    destination: 'uploads/',
    filename: (req,file,cb) => {
        const ext = extname(file.originalname);
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
    }
})

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    // Allow images, PDFs, Word documents, Excel, and PowerPoint
    const allowedMimes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif',
      'image/bmp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/csv'
    ];
    
    logger.log('File upload attempt:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    if (allowedMimes.includes(file.mimetype)) {
      logger.log('File type accepted');
      cb(null, true);
    } else {
      logger.log('File type rejected:', file.mimetype);
      cb(new Error(`Invalid file type: ${file.mimetype}. Only images, PDF, Word, Excel, and PowerPoint documents are allowed.`), false);
    }
  }
});

// const upload = multer({ storage });
module.exports = upload;