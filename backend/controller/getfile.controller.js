const filemodel = require('../model/file.model');
const bcrypt = require('bcryptjs');

const getFileByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const { password } = req.body; // Password in body for security
    const clientIp = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || 'Unknown';

    const fileDoc = await filemodel.findOne({ code: code.toUpperCase() }).select('+password');

    if (!fileDoc) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check expiry
    if (new Date() > fileDoc.expiry) {
      return res.status(410).json({ message: 'File expired' });
    }

    // Check password if required
    if (fileDoc.hasPassword) {
      if (!password) {
        return res.status(401).json({ 
          message: 'Password required',
          requiresPassword: true 
        });
      }
      
      const isValidPassword = await bcrypt.compare(password, fileDoc.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          message: 'Invalid password',
          requiresPassword: true 
        });
      }
    }

    // Check download limit
    if (fileDoc.maxDownloads && fileDoc.downloadCount >= fileDoc.maxDownloads) {
      return res.status(403).json({ 
        message: 'Maximum download limit reached',
        maxDownloads: fileDoc.maxDownloads,
        currentDownloads: fileDoc.downloadCount
      });
    }

    // Log access
    fileDoc.accessLogs.push({
      ip: clientIp,
      userAgent: userAgent,
      accessedAt: new Date()
    });

    // Increment download count
    fileDoc.downloadCount += 1;
    await fileDoc.save();

    res.json({
      fileUrl: fileDoc.fileUrl,
      originalFileName: fileDoc.originalFileName,
      fileSize: fileDoc.fileSize,
      conversionType: fileDoc.conversionType,
      expiry: fileDoc.expiry,
      description: fileDoc.description,
      downloadCount: fileDoc.downloadCount,
      maxDownloads: fileDoc.maxDownloads,
      createdAt: fileDoc.createdAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get file info without incrementing download count
const getFileInfo = async (req, res) => {
  try {
    const { code } = req.params;
    
    const fileDoc = await filemodel.findOne({ code: code.toUpperCase() });

    if (!fileDoc) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check expiry
    if (new Date() > fileDoc.expiry) {
      return res.status(410).json({ message: 'File expired' });
    }

    res.json({
      originalFileName: fileDoc.originalFileName,
      fileSize: fileDoc.fileSize,
      conversionType: fileDoc.conversionType,
      expiry: fileDoc.expiry,
      description: fileDoc.description,
      hasPassword: fileDoc.hasPassword,
      downloadCount: fileDoc.downloadCount,
      maxDownloads: fileDoc.maxDownloads,
      createdAt: fileDoc.createdAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getFileByCode, getFileInfo };
