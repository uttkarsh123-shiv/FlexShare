const filemodel = require('../model/file.model');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

const getFileByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const { password } = req.body; // Password in body for security
    const clientIp = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || 'Unknown';

    logger.log(`File access attempt: ${code}, IP: ${clientIp}, HasPassword: ${!!password}`);

    // Handle codes with dashes - remove dashes and validate
    const cleanCode = code.replace(/-/g, '').toUpperCase();
    
    // Validate code format
    if (!cleanCode || cleanCode.length !== 6) {
      return res.status(400).json({ message: 'Invalid file code format' });
    }

    // Handle both Mongoose and memory storage
    let fileDoc;
    const model = filemodel;
    
    // Check if we're using Mongoose (has select method) or memory storage
    const query = model.findOne({ code: cleanCode });
    if (query && typeof query.select === 'function') {
      // Mongoose query - can use select
      fileDoc = await query.select('+password');
    } else {
      // Memory storage or direct promise - await directly
      fileDoc = await query;
    }

    if (!fileDoc) {
      logger.log(`File not found: ${cleanCode} (original: ${code})`);
      return res.status(404).json({ message: 'File not found or has been removed' });
    }

    // Check expiry
    if (new Date() > fileDoc.expiry) {
      logger.log(`File expired: ${cleanCode} (original: ${code}), expired at: ${fileDoc.expiry}`);
      return res.status(410).json({ message: 'File has expired' });
    }

    // Check password if required
    if (fileDoc.hasPassword) {
      if (!password) {
        logger.log(`Password required for file: ${cleanCode} (original: ${code})`);
        return res.status(401).json({ 
          message: 'Password required to access this file',
          requiresPassword: true 
        });
      }
      
      try {
        const isValidPassword = await bcrypt.compare(password, fileDoc.password);
        if (!isValidPassword) {
          logger.log(`Invalid password attempt for file: ${cleanCode} (original: ${code})`);
          return res.status(401).json({ 
            message: 'Invalid password',
            requiresPassword: true 
          });
        }
      } catch (bcryptError) {
        logger.error('Password comparison error:', bcryptError);
        return res.status(500).json({ message: 'Authentication error' });
      }
    }

    // Check download limit
    if (fileDoc.maxDownloads && fileDoc.downloadCount >= fileDoc.maxDownloads) {
      logger.log(`Download limit reached for file: ${cleanCode} (original: ${code}), count: ${fileDoc.downloadCount}, max: ${fileDoc.maxDownloads}`);
      return res.status(403).json({ 
        message: 'Maximum download limit reached for this file',
        maxDownloads: fileDoc.maxDownloads,
        currentDownloads: fileDoc.downloadCount
      });
    }

    // Validate file URL
    if (!fileDoc.fileUrl) {
      logger.error(`File URL missing for code: ${cleanCode} (original: ${code})`);
      return res.status(500).json({ message: 'File URL not available' });
    }

    // Log access
    if (fileDoc.accessLogs) {
      fileDoc.accessLogs.push({
        ip: clientIp,
        userAgent: userAgent,
        accessedAt: new Date()
      });
    }

    // Increment download count
    fileDoc.downloadCount = (fileDoc.downloadCount || 0) + 1;
    
    try {
      await fileDoc.save();
    } catch (saveError) {
      logger.error('Error saving download count:', saveError);
      // Continue with response even if save fails
    }

    logger.log(`File access successful: ${cleanCode} (original: ${code}), new download count: ${fileDoc.downloadCount}`);

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
    logger.error('getFileByCode error:', err);
    res.status(500).json({ message: 'Server error while accessing file' });
  }
};

// Get file info without incrementing download count
const getFileInfo = async (req, res) => {
  try {
    const { code } = req.params;
    const { markFirstView } = req.query;
    const clientIp = req.ip || req.connection.remoteAddress;
    
    logger.log(`File info request: ${code}, IP: ${clientIp}, markFirstView: ${markFirstView}`);

    // Handle codes with dashes - remove dashes and validate
    const cleanCode = code.replace(/-/g, '').toUpperCase();
    
    // Validate code format
    if (!cleanCode || cleanCode.length !== 6) {
      return res.status(400).json({ message: 'Invalid file code format' });
    }
    
    // Use lean query for better performance (returns plain JS object)
    const model = filemodel;
    let fileDoc;
    
    const query = model.findOne({ code: cleanCode });
    if (query && typeof query.lean === 'function') {
      // Mongoose query - use lean for better performance
      fileDoc = await query.lean();
    } else {
      // Memory storage - await directly
      fileDoc = await query;
    }

    if (!fileDoc) {
      logger.log(`File not found for info request: ${cleanCode} (original: ${code})`);
      return res.status(404).json({ message: 'File not found or has been removed' });
    }

    // Check expiry
    if (new Date() > fileDoc.expiry) {
      logger.log(`File expired for info request: ${cleanCode} (original: ${code}), expired at: ${fileDoc.expiry}`);
      return res.status(410).json({ message: 'File has expired' });
    }

    // Return only necessary fields for better performance
    res.json({
      fileUrl: fileDoc.fileUrl,
      originalFileName: fileDoc.originalFileName,
      fileSize: fileDoc.fileSize,
      conversionType: fileDoc.conversionType,
      expiry: fileDoc.expiry,
      description: fileDoc.description,
      hasPassword: fileDoc.hasPassword,
      downloadCount: fileDoc.downloadCount || 0,
      maxDownloads: fileDoc.maxDownloads,
      createdAt: fileDoc.createdAt
    });
  } catch (err) {
    logger.error('Error in getFileInfo:', err);
    res.status(500).json({ message: 'Server error while fetching file information' });
  }
};

module.exports = { getFileByCode, getFileInfo };
