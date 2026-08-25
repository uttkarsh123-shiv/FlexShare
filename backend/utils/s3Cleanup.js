const mongoose = require('mongoose');
const { deleteFromS3 } = require('./s3Helper');
const logger = require('./logger');

/**
 * Finds all expired documents, deletes their S3 files, then removes the documents.
 * Runs before MongoDB TTL index fires so S3 files are never orphaned.
 */
async function cleanupExpiredFiles() {
  if (mongoose.connection.readyState !== 1) return;

  // Get the already-registered model — safe because connectDB() is called before this
  const File = mongoose.models.File || require('../model/file.model')._getMongooseModel?.();
  if (!File || typeof File.find !== 'function') {
    logger.error('[Cleanup] Could not resolve File model — skipping');
    return;
  }

  const now = new Date();
  const expired = await File.find(
    { expiry: { $lte: now }, fileUrl: { $ne: '' } },
    { _id: 1, fileUrl: 1, code: 1 }
  ).lean();

  if (!expired.length) return;

  logger.log(`[Cleanup] Found ${expired.length} expired file(s) to clean up`);

  let deleted = 0;
  let failed  = 0;

  for (const doc of expired) {
    try {
      if (doc.fileUrl) await deleteFromS3(doc.fileUrl);
      await File.deleteOne({ _id: doc._id });
      deleted++;
      logger.log(`[Cleanup] Deleted file ${doc.code}`);
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
  const INTERVAL_MS = 60 * 60 * 1000;

  cleanupExpiredFiles().catch((err) =>
    logger.error(`[Cleanup] Startup run failed: ${err.message}`)
  );

  setInterval(() => {
    cleanupExpiredFiles().catch((err) =>
      logger.error(`[Cleanup] Scheduled run failed: ${err.message}`)
    );
  }, INTERVAL_MS);

  logger.log('[Cleanup] S3 cleanup cron started (runs every 1 hour)');
}

module.exports = { startCleanupCron, cleanupExpiredFiles };
