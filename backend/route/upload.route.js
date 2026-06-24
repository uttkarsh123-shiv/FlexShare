const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadAndConvertFile, uploadBatchFiles } = require('../controller/upload.controller');
const { validateUpload } = require('../middleware/validation');
const { uploadLimiter } = require('../middleware/rateLimiter');
const logger = require('../utils/logger');
const filemodel = require('../model/file.model');

router.post('/uploads',
  uploadLimiter,
  upload.single('file'),
  validateUpload,
  uploadAndConvertFile
);

router.post('/uploads/batch',
  uploadLimiter,
  upload.array('files', 10),
  validateUpload,
  uploadBatchFiles
);

router.get('/uploads/status/:code', async (req, res) => {
  const file = await filemodel.findOne({ code: req.params.code.toUpperCase() }).catch(() => null);
  if (!file) return res.status(404).json({ message: 'File not found' });
  res.json({
    code: file.code,
    status: file.status,
    url: file.status === 'done' ? file.fileUrl : null,
    conversionType: file.conversionType,
  });
});

// Dev/debug route — remove in production if not needed
if (process.env.NODE_ENV !== 'production') {
  router.post('/test-upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'File is required' });
    logger.log('Test upload:', req.file.originalname, req.file.size);
    res.json({ message: 'Test upload successful', file: req.file });
  });

  router.get('/test-files', async (req, res) => {
    const file = await filemodel.findOne({}).sort({ createdAt: -1 }).catch(() => null);
    res.json({ files: file ? [file] : [], count: file ? 1 : 0 });
  });
}

module.exports = router;
