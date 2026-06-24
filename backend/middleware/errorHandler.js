const multer = require('multer');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error:', err);

  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'File too large. Maximum size is 10MB.'
      : err.message;
    return res.status(400).json({ success: false, message });
  }

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
