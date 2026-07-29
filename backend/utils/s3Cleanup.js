const mongoose = require('mongoose');
const { deleteFromS3 } = require('./s3Helper');
const logger = require('./logger');

/**
 * Finds all expired documents, deletes their S3 files, then removes the documents.
 * This runs before MongoDB's TTL index fires so S3 files are never orphaned.
 */
async function cleanupExpiredFiles() {
  if (mongoose.connection.readyState !== 1) return;

  const File = mongoose.model('File');
  const now = new Date();

  const expired = await File.find(
    { expiry: { $lte: now }, fileUrl: { $ne: '' } },
    { _id: 1, fileUrl: 1, code: 1 }
  ).lean();

  if (!expired.length) return;

  logger.log(`[Cleanup] Found ${expired.length} expired file(s) to clean up`);

  let deleted = 0;
  let failed = 0;

  for (const doc of expired) {
    try {
      // Delete from S3 first
      if (doc.fileUrl) {
        await deleteFromS3(doc.fileUrl);
      }
      // Then delete the MongoDB document
      await File.deleteOne({ _id: doc._id });
      deleted++;
      logger.log(`[Cleanup] Deleted file ${doc.code} (${doc.fileUrl})`);
    } catch (err) {
      failed++;
      logger.error(`[Cleanup] Failed to delete file ${doc.code}: ${err.message}`);
    }
  }

  logger.log(`[Cleanup] Done — deleted: ${deleted}, failed: ${failed}`);
}

/**
 * Starts the cleanup cron — runs immediately on startup, then every hour.
 */
function startCleanupCron() {
  const INTERVAL_MS = 60 * 60 * 1000; // 1 hour

  // Run once on startup
  cleanupExpiredFiles().catch((err) =>
    logger.error(`[Cleanup] Startup run failed: ${err.message}`)
  );

  // Then run every hour
  setInterval(() => {
    cleanupExpiredFiles().catch((err) =>
      logger.error(`[Cleanup] Scheduled run failed: ${err.message}`)
    );
  }, INTERVAL_MS);

  logger.log('[Cleanup] S3 cleanup cron started (runs every 1 hour)');
}

module.exports = { startCleanupCron, cleanupExpiredFiles };
