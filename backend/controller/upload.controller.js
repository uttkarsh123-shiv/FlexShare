const { uploadToS3 } = require('../utils/s3Helper');
const filemodel = require('../model/file.model');
const { customAlphabet } = require('nanoid');
const bcrypt = require('bcryptjs');
const path = require('path');
const logger = require('../utils/logger');
const conversionQueue = require('../queue/conversionQueue');

const generateCode = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

const allowedConversions = [
  'image->png', 'image->jpg', 'image->jpeg', 'image->webp', 'image->gif',
  'image->bmp', 'image->avif', 'image->pdf',
  'pdf->word', 'word->pdf', 'pdf->txt',
  'excel->pdf', 'excel->csv', 'ppt->pdf', 'word->txt',
  'none',
];

const extensionMap = {
  word: 'docx', txt: 'txt', pdf: 'pdf', png: 'png', jpg: 'jpg',
  jpeg: 'jpeg', webp: 'webp', gif: 'gif', bmp: 'bmp', avif: 'avif', csv: 'csv',
};

const getConvertedFileName = (originalName, conversionType) => {
  if (!conversionType || conversionType === 'none') return originalName;
  const base = path.parse(originalName).name;
  const target = conversionType.split('->')[1];
  return `${base}.${extensionMap[target] || target}`;
};

const parseCommonFields = async (body) => {
  const hours = parseInt(body.expiryHours, 10) || 1;
  const expiry = new Date(Date.now() + hours * 60 * 60 * 1000);

  const hashedPassword = body.password?.trim()
    ? await bcrypt.hash(body.password.trim(), 10)
    : null;

  const parsed = parseInt(body.maxDownloads, 10);
  const downloadLimit = (!isNaN(parsed) && parsed >= 1 && parsed <= 100) ? parsed : null;

  return { hours, expiry, hashedPassword, downloadLimit };
};


const uploadAndConvertFile = async (req, res) => {
  const file = req.file;
  const { conversionType, description } = req.body;

  if (!file) return res.status(400).json({ message: 'File is required' });
  if (file.size > 10 * 1024 * 1024) return res.status(400).json({ message: 'File size exceeds 10MB limit' });
  if (conversionType && conversionType !== 'none' && !allowedConversions.includes(conversionType)) {
    return res.status(400).json({ message: 'Invalid conversion type' });
  }

  const { hours, expiry, hashedPassword, downloadLimit } = await parseCommonFields(req.body);
  const code = generateCode();
  const sharedFields = {
    code, expiry,
    fileSize: file.size,
    conversionType: conversionType || 'none',
    description: description || 'No description provided',
    password: hashedPassword,
    hasPassword: !!hashedPassword,
    maxDownloads: downloadLimit,
    downloadCount: 0,
  };

  if (!conversionType || conversionType === 'none') {
    const s3Key = await uploadToS3(file.buffer, file.originalname, 'original_files');
    const fileDoc = await filemodel.create({
      ...sharedFields,
      fileUrl: s3Key,
      originalFileName: file.originalname,
      status: 'done',
    });

    return res.json({
      code, expiry,
      description: fileDoc.description,
      hasPassword: fileDoc.hasPassword,
      maxDownloads: fileDoc.maxDownloads,
      expiresIn: `${hours} hour${hours > 1 ? 's' : ''}`,
      status: 'done',
    });
  }

  // Conversion needed — enqueue job, respond immediately
  const fileDoc = await filemodel.create({
    ...sharedFields,
    fileUrl: '',
    originalFileName: getConvertedFileName(file.originalname, conversionType),
    status: 'pending',
  });

  const job = await conversionQueue.add('convert', {
    fileBuffer: file.buffer,
    originalName: file.originalname,
    conversionType,
    dbRecordId: fileDoc._id,
  });

  logger.log(`Job ${job.id} enqueued for code ${code}`);

  return res.json({
    code, jobId: job.id, expiry,
    description: fileDoc.description,
    hasPassword: fileDoc.hasPassword,
    maxDownloads: fileDoc.maxDownloads,
    expiresIn: `${hours} hour${hours > 1 ? 's' : ''}`,
    status: 'pending',
  });
};

// ── Batch upload ──────────────────────────────────────────────────────────────

const uploadBatchFiles = async (req, res) => {
  const files = req.files;
  const { conversionType, description } = req.body;

  if (!files?.length) return res.status(400).json({ message: 'No files uploaded' });
  if (!conversionType) return res.status(400).json({ message: 'Conversion type is required' });
  if (files.length > 10) return res.status(400).json({ message: 'Maximum 10 files allowed per batch' });

  const { hours, expiry, hashedPassword, downloadLimit } = await parseCommonFields(req.body);
  const results = [];

  for (const file of files) {
    try {
      const code = generateCode();
      const fileDoc = await filemodel.create({
        code, expiry,
        fileUrl: '',
        originalFileName: getConvertedFileName(file.originalname, conversionType),
        fileSize: file.size,
        conversionType,
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
};

module.exports = { uploadAndConvertFile, uploadBatchFiles };
