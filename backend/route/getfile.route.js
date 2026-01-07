const express = require('express');
const { getFileByCode, getFileInfo } = require('../controller/getfile.controller');
const { validateFileCode } = require('../middleware/validation');
const { fileAccessLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

// Get file info (doesn't increment download count)
router.get('/file/:code/info', 
  fileAccessLimiter,
  validateFileCode,
  getFileInfo
);

// Get file with download (increments count, requires password if set)
router.post('/file/:code', 
  fileAccessLimiter,
  validateFileCode,
  getFileByCode
);

module.exports = router;
