const cloudinary = require('../config/cloudinary');
const filemodel = require('../model/file.model');
const { customAlphabet } = require('nanoid');
const bcrypt = require('bcryptjs');
const path = require('path');
const logger = require('../utils/logger');
const conversionQueue = require('../queue/conversionQueue');

const generateCode = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

const getConvertedFileName = (originalName, conversionType) => {
  if (!conversionType || conversionType === 'none') return originalName;
  const baseName = path.parse(originalName).name;
  const targetFormat = conversionType.split('->')[1];
  const extensionMap = {
    word: 'docx', txt: 'txt', pdf: 'pdf', png: 'png', jpg: 'jpg',
    jpeg: 'jpeg', webp: 'webp', gif: 'gif', bmp: 'bmp', avif: 'avif', csv: 'csv'
  };
  return `${baseName}.${extensionMap[targetFormat] || targetFormat}`;
};

const allowedConversions = [
  'image->png', 'image->jpg', 'image->jpeg', 'image->webp', 'image->gif',
  'image->bmp', 'image->avif', 'image->pdf',
  'pdf->word', 'word->pdf', 'pdf->txt',
  'excel->pdf', 'excel->csv', 'ppt->pdf', 'word->txt',
  'none'
];

// ── shared helpers ────────────────────────────────────────────────────────────

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto', timeout: 120000, invalidate: true },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

const parseCommonFields = async (body) => {
  const hours = parseInt(body.expiryHours, 10) || 1;
  const expiry = new Date(Date.now() + hours * 60 * 60 * 1000);

  let hashedPassword = null;
  if (body.password?.trim()) {
    hashedPassword = await bcrypt.hash(body.password.trim(), 10);
  }

  let downloadLimit = null;
  const parsed = parseInt(body.maxDownloads, 10);
  if (!isNaN(parsed) && parsed >= 1 && parsed <= 100) downloadLimit = parsed;

  return { hours, expiry, hashedPassword, downloadLimit };
};

// ── single file upload ────────────────────────────────────────────────────────

const uploadAndConvertFile = async (req, res) => {
  try {
    const file = req.file;
    const { conversionType, description } = req.body;

    if (!file) return res.status(400).json({ message: 'File is required' });

    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ message: 'File size exceeds 10MB limit' });
    }

    if (conversionType && conversionType !== 'none' && !allowedConversions.includes(conversionType)) {
      return res.status(400).json({ message: 'Invalid conversion type' });
    }

    const { hours, expiry, hashedPassword, downloadLimit } = await parseCommonFields(req.body);
    const code = generateCode();

    // ── no conversion: upload original directly, respond immediately ──────────
    if (!conversionType || conversionType === 'none') {
      const uploadResult = await uploadToCloudinary(file.buffer, 'original_files');

      const fileDoc = await filemodel.create({
        code,
        fileUrl: uploadResult.secure_url,
        originalFileName: file.originalname,
        fileSize: file.size,
        conversionType: 'none',
        expiry,
        description: description || 'No description provided',
        password: hashedPassword,
        hasPassword: !!hashedPassword,
        maxDownloads: downloadLimit,
        downloadCount: 0,
        status: 'done',
      });

      return res.json({
        code,
        url: uploadResult.secure_url,
        expiry,
        description: fileDoc.description,
        hasPassword: fileDoc.hasPassword,
        maxDownloads: fileDoc.maxDownloads,
        expiresIn: `${hours} hour${hours > 1 ? 's' : ''}`,
        status: 'done',
      });
    }

    // ── conversion needed: create DB record as pending, enqueue job ───────────
    // We use a placeholder URL — the worker will overwrite it with the real one
    const fileDoc = await filemodel.create({
      code,
      fileUrl: '',
      originalFileName: getConvertedFileName(file.originalname, conversionType),
      fileSize: file.size,
      conversionType,
      expiry,
      description: description || 'No description provided',
      password: hashedPassword,
      hasPassword: !!hashedPassword,
      maxDownloads: downloadLimit,
      downloadCount: 0,
      status: 'pending',
    });

    const job = await conversionQueue.add('convert', {
      fileBuffer: file.buffer,       // worker restores this with Buffer.from()
      originalName: file.originalname,
      conversionType,
      dbRecordId: fileDoc._id,
    });

    logger.log(`Job ${job.id} enqueued for code ${code}`);

    // Respond immediately — client polls /api/file/:code/status
    return res.json({
      code,
      jobId: job.id,
      expiry,
      description: fileDoc.description,
      hasPassword: fileDoc.hasPassword,
      maxDownloads: fileDoc.maxDownloads,
      expiresIn: `${hours} hour${hours > 1 ? 's' : ''}`,
      status: 'pending',
    });

  } catch (err) {
    logger.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

// ── batch upload (enqueues each file as a separate job) ───────────────────────

const uploadBatchFiles = async (req, res) => {
  try {
    const files = req.files;
    const { conversionType, description, expiryHours, maxDownloads } = req.body;

    if (!files?.length) return res.status(400).json({ message: 'No files uploaded' });
    if (!conversionType) return res.status(400).json({ message: 'Conversion type is required' });
    if (files.length > 10) return res.status(400).json({ message: 'Maximum 10 files allowed per batch' });

    const { hours, expiry, hashedPassword, downloadLimit } = await parseCommonFields(req.body);
    const results = [];

    for (const file of files) {
      try {
        const code = generateCode();

        const fileDoc = await filemodel.create({
          code,
          fileUrl: '',
          originalFileName: getConvertedFileName(file.originalname, conversionType),
          fileSize: file.size,
          conversionType,
          expiry,
          description: description || 'No description provided',
          password: hashedPassword,
          hasPassword: !!hashedPassword,
          maxDownloads: downloadLimit,
          downloadCount: 0,
          status: 'pending',
        });

        const job = await conversionQueue.add('convert', {
          fileBuffer: file.buffer,
          originalName: file.originalname,
          conversionType,
          dbRecordId: fileDoc._id,
        });

        results.push({ code, jobId: job.id, fileName: file.originalname, status: 'pending', success: true });
      } catch (err) {
        results.push({ fileName: file.originalname, error: err.message, success: false });
      }
    }

    const successful = results.filter(r => r.success);
    res.json({
      total: files.length,
      successful: successful.length,
      failed: results.length - successful.length,
      results,
      expiresIn: `${hours} hour${hours > 1 ? 's' : ''}`,
    });

  } catch (err) {
    logger.error('Batch upload error:', err);
    res.status(500).json({ message: 'Batch upload failed', error: err.message });
  }
};

module.exports = { uploadAndConvertFile, uploadBatchFiles };
