const { Worker } = require('bullmq');
const { getRedisConnection } = require('./redisConnection');
const { uploadToS3 } = require('../utils/s3Helper');
const filemodel = require('../model/file.model');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');
const { cleanupFiles } = require('../utils/fileCleanup');
const logger = require('../utils/logger');
const LibreOfficeConverter = require('../utils/libreofficeConverter');

const uploadsDir = path.join(__dirname, '../uploads');

const imageToPdf = async (inputPath) => {
  const imgBuffer = await sharp(inputPath)
    .resize({ fit: 'inside', width: 2000, height: 2000, withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  const pdfDoc = await PDFDocument.create();
  const jpg = await pdfDoc.embedJpg(imgBuffer);
  const { width: w, height: h } = jpg.scale(1);
  const ratio = Math.min(595 / w, 842 / h, 1); // fit to A4
  const page = pdfDoc.addPage([w * ratio, h * ratio]);
  page.drawImage(jpg, { x: 0, y: 0, width: w * ratio, height: h * ratio });
  return pdfDoc.save(); // returns a Buffer
};

// ── worker ───────────────────────────────────────────────────────────────────

const worker = new Worker(
  'file-conversion',
  async (job) => {
    const { fileBuffer, originalName, conversionType, dbRecordId } = job.data;
    logger.log(`[Worker] Job ${job.id} started: ${conversionType}`);

    await filemodel.findByIdAndUpdate(dbRecordId, { status: 'processing' });

    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const targetFormat = conversionType.split('->')[1];
    const tempPath = path.join(uploadsDir, `temp-${Date.now()}${path.extname(originalName)}`);
    let convertedPath = path.join(uploadsDir, `converted-${Date.now()}.${targetFormat}`);

    // Restore buffer from job data and write to temp file
    fs.writeFileSync(tempPath, Buffer.from(fileBuffer));

    try {
      // ── convert ────────────────────────────────────────────────────────────
      if (conversionType === 'image->pdf') {
        fs.writeFileSync(convertedPath, await imageToPdf(tempPath));

      } else if (conversionType.startsWith('image->')) {
        const fmt = targetFormat === 'jpg' ? 'jpeg' : targetFormat;
        await sharp(tempPath).toFormat(fmt, { quality: 85 }).toFile(convertedPath);

      } else if (['word->pdf','pdf->word','excel->pdf','ppt->pdf','word->txt','excel->csv','pdf->txt'].includes(conversionType)) {
        convertedPath = await LibreOfficeConverter.convertWithFallback(tempPath, uploadsDir, conversionType);

      } else {
        fs.copyFileSync(tempPath, convertedPath);
      }

      // ── upload to S3 ──────────────────────────────────────────────────────
      const s3Key = await uploadToS3(
        fs.readFileSync(convertedPath),
        path.basename(convertedPath),
        'converted_files'
      );

      await filemodel.findByIdAndUpdate(dbRecordId, { fileUrl: s3Key, status: 'done' });
      logger.log(`[Worker] Job ${job.id} done: ${s3Key}`);
      return { key: s3Key };

    } finally {
      await cleanupFiles([tempPath, convertedPath]);
    }
  },
  { connection: getRedisConnection(), concurrency: 5 }
);

worker.on('completed', (job) => logger.log(`[Worker] Job ${job.id} completed`));
worker.on('failed', async (job, err) => {
  logger.error(`[Worker] Job ${job.id} failed: ${err.message}`);
  await filemodel.findByIdAndUpdate(job.data.dbRecordId, { status: 'failed' }).catch(() => {});
});

module.exports = worker;
