const express = require('express');
const { getFileByCode, getFileInfo } = require('../controller/getfile.controller');
const { validateFileCode } = require('../middleware/validation');
const { fileInfoRateLimiter, fileAccessRateLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

// Get file info (doesn't increment download count) - stricter rate limiting
router.get('/file/:code/info', 
  fileInfoRateLimiter,
  validateFileCode,
  getFileInfo
);

// Get file with download (increments count, requires password if set)
router.post('/file/:code', 
  fileAccessRateLimiter,
  validateFileCode,
  getFileByCode
);

module.exports = router;
