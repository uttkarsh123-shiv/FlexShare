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
      createdAt: fileDoc.createdAt,
      firstViewShown: fileDoc.firstViewShown
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
    
    console.log(`Getting file info for code: ${code}`);
    
    const fileDoc = await filemodel.findOne({ code: code.toUpperCase() });

    if (!fileDoc) {
      console.log(`File not found for code: ${code}`);
      return res.status(404).json({ message: 'File not found' });
    }

    console.log(`File found: ${fileDoc.originalFileName}, expires: ${fileDoc.expiry}`);

    // Check expiry
    if (new Date() > fileDoc.expiry) {
      console.log(`File expired for code: ${code}`);
      return res.status(410).json({ message: 'File expired' });
    }

    // If caller requests to mark the first (detailed) view (typically the uploader
    // immediately after conversion), set `firstViewShown` to true so future visits
    // render the compact/card UI. We return `allowDetailedView` to indicate whether
    // this request should show the full detailed UI.
    const mark = req.query.markFirstView === 'true';
    let allowDetailedView = false;

    if (mark && !fileDoc.firstViewShown) {
      fileDoc.firstViewShown = true;
      await fileDoc.save();
      allowDetailedView = true;
    }

    // If file has password protection, don't return sensitive information
    if (fileDoc.hasPassword) {
      console.log(`Password protected file for code: ${code}`);
      return res.json({
        originalFileName: fileDoc.originalFileName,
        fileSize: fileDoc.fileSize,
        conversionType: fileDoc.conversionType,
        expiry: fileDoc.expiry,
        description: fileDoc.description,
        hasPassword: true,
        requiresPassword: true, // Indicate that password is needed
        createdAt: fileDoc.createdAt,
        allowDetailedView: allowDetailedView
      });
    }

    console.log(`Returning file info for code: ${code}`);
    res.json({
      fileUrl: fileDoc.fileUrl, // Only include fileUrl for non-password protected files
      originalFileName: fileDoc.originalFileName,
      fileSize: fileDoc.fileSize,
      conversionType: fileDoc.conversionType,
      expiry: fileDoc.expiry,
      description: fileDoc.description,
      hasPassword: false,
      downloadCount: fileDoc.downloadCount,
      maxDownloads: fileDoc.maxDownloads,
      createdAt: fileDoc.createdAt,
      firstViewShown: fileDoc.firstViewShown,
      allowDetailedView: allowDetailedView
    });
  } catch (err) {
    console.error('Error in getFileInfo:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getFileByCode, getFileInfo };
