const express = require('express');
const router = express.Router();
const upload = require("../middleware/upload");
const { uploadAndConvertFile, uploadBatchFiles } = require('../controller/upload.controller');
const { validateUpload } = require('../middleware/validation');
const { uploadLimiter } = require('../middleware/rateLimiter');
const logger = require('../utils/logger');

// Single file upload with validation and rate limiting
router.post('/uploads', 
  uploadLimiter,
  upload.single('file'), 
  validateUpload,
  uploadAndConvertFile
);

// Test endpoint for basic upload without conversion
router.post('/test-upload', 
  uploadLimiter,
  upload.single('file'),
  async (req, res) => {
    try {
      logger.log('Test upload request received');
      
      if (!req.file) {
        return res.status(400).json({ message: 'File is required' });
      }
      
      logger.log('File received:', {
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
      
      res.json({ 
        message: 'Test upload successful',
        file: {
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    } catch (error) {
      logger.error('Test upload error:', error);
      res.status(500).json({ message: 'Test upload failed', error: error.message });
    }
  }
);

// Test endpoint to list recent files (for debugging)
router.get('/test-files', async (req, res) => {
  try {
    const filemodel = require('../model/file.model');
    const files = await filemodel.findOne({}).sort({ createdAt: -1 }).limit(5);
    
    if (!files) {
      return res.json({ message: 'No files found', count: 0 });
    }
    
    res.json({ 
      message: 'Recent files found',
      files: files ? [files] : [],
      count: files ? 1 : 0
    });
  } catch (error) {
    logger.error('Test files error:', error);
    res.status(500).json({ message: 'Failed to fetch files', error: error.message });
  }
});

// Batch file upload
router.post('/uploads/batch', 
  uploadLimiter,
  upload.array('files', 10), // Max 10 files
  validateUpload,
  uploadBatchFiles
);

module.exports = router;