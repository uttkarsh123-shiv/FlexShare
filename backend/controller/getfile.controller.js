const filemodel = require('../model/file.model');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const { getPresignedUrl } = require('../utils/s3Helper');

const cleanCode = (code) => code.replace(/-/g, '').toUpperCase();

const getFileByCode = async (req, res) => {
  try {
    const code = cleanCode(req.params.code);
    if (code.length !== 6) return res.status(400).json({ message: 'Invalid file code format' });

    const fileDoc = await filemodel.findOne({ code }).select('+password');
    if (!fileDoc) return res.status(404).json({ message: 'File not found or has been removed' });
    if (new Date() > fileDoc.expiry) return res.status(410).json({ message: 'File has expired' });

    if (fileDoc.hasPassword) {
      const { password } = req.body;
      if (!password) {
        return res.status(401).json({ message: 'Password required to access this file', requiresPassword: true });
      }
      const valid = await bcrypt.compare(password, fileDoc.password);
      if (!valid) {
        return res.status(401).json({ message: 'Invalid password', requiresPassword: true });
      }
    }

    if (fileDoc.maxDownloads && fileDoc.downloadCount >= fileDoc.maxDownloads) {
      return res.status(403).json({ message: 'Maximum download limit reached for this file' });
    }

    if (!fileDoc.fileUrl) return res.status(500).json({ message: 'File URL not available' });

    fileDoc.downloadCount = (fileDoc.downloadCount || 0) + 1;
    await fileDoc.save().catch((err) => logger.error('Error saving download count:', err));

    const presignedUrl = await getPresignedUrl(fileDoc.fileUrl, fileDoc.originalFileName);

    res.json({
      fileUrl: presignedUrl,
      originalFileName: fileDoc.originalFileName,
      fileSize: fileDoc.fileSize,
      conversionType: fileDoc.conversionType,
      expiry: fileDoc.expiry,
      description: fileDoc.description,
      downloadCount: fileDoc.downloadCount,
      maxDownloads: fileDoc.maxDownloads,
      createdAt: fileDoc.createdAt,
    });
  } catch (err) {
    logger.error('getFileByCode error:', err);
    res.status(500).json({ message: 'Server error while accessing file' });
  }
};

const getFileInfo = async (req, res) => {
  try {
    const code = cleanCode(req.params.code);
    if (code.length !== 6) return res.status(400).json({ message: 'Invalid file code format' });

    const fileDoc = await filemodel.findOne({ code }).lean();
    if (!fileDoc) return res.status(404).json({ message: 'File not found or has been removed' });
    if (new Date() > fileDoc.expiry) return res.status(410).json({ message: 'File has expired' });

    res.json({
      originalFileName: fileDoc.originalFileName,
      fileSize: fileDoc.fileSize,
      conversionType: fileDoc.conversionType,
      expiry: fileDoc.expiry,
      description: fileDoc.description,
      hasPassword: fileDoc.hasPassword,
      downloadCount: fileDoc.downloadCount || 0,
      maxDownloads: fileDoc.maxDownloads,
      createdAt: fileDoc.createdAt,
    });
  } catch (err) {
    logger.error('getFileInfo error:', err);
    res.status(500).json({ message: 'Server error while fetching file information' });
  }
};

module.exports = { getFileByCode, getFileInfo };
