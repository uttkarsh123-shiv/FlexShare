const fs = require('fs');
const logger = require('./logger');

async function cleanupFiles(filePaths) {
  for (const filePath of filePaths) {
    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      logger.error('Failed to delete temp file:', filePath, err.message);
    }
  }
}

module.exports = { cleanupFiles };
