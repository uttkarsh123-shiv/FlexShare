const fs = require('fs');
const logger = require('./logger');

/**
 * Safely delete a file with retry logic and proper error handling
 * @param {string} filePath - Path to the file to delete
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} delay - Delay between retries in milliseconds
 */
async function safeDeleteFile(filePath, maxRetries = 3, delay = 200) {
  if (!filePath || !fs.existsSync(filePath)) {
    return;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Add a small delay to ensure file handles are released
      await new Promise(resolve => setTimeout(resolve, delay));
      
      fs.unlinkSync(filePath);
      logger.log(`✅ File deleted successfully: ${filePath}`);
      return;
    } catch (error) {
      logger.warn(`⚠️  Attempt ${attempt}/${maxRetries} failed to delete ${filePath}:`, error.message);
      
      if (attempt === maxRetries) {
        logger.error(`❌ Failed to delete file after ${maxRetries} attempts: ${filePath}`);
        // Don't throw error, just log it - file will be cleaned up by OS eventually
      } else {
        // Wait longer before next attempt
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
}

/**
 * Clean up multiple files safely
 * @param {string[]} filePaths - Array of file paths to delete
 */
async function cleanupFiles(filePaths) {
  const cleanupPromises = filePaths
    .filter(path => path && fs.existsSync(path))
    .map(path => safeDeleteFile(path));
  
  await Promise.allSettled(cleanupPromises);
}

module.exports = {
  safeDeleteFile,
  cleanupFiles
};