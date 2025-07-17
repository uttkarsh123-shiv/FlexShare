const filemodel = require('../model/file.model');
const mongoose = require('mongoose');

const getFileByCode = async (req, res) => {
  try {
    const { code } = req.params;
    console.log('Searching for code:', code);

    // maybe your codes in DB are uppercase
    const fileDoc = await filemodel.findOne({ code: code.toUpperCase() });
    console.log('Found fileDoc:', fileDoc);

    if (!fileDoc) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check expiry
    if (new Date() > fileDoc.expiry) {
      return res.status(410).json({ message: 'File expired' });
    }

    res.json({
      fileUrl: fileDoc.fileUrl,
      conversionType: fileDoc.conversionType,
      expiry: fileDoc.expiry
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getFileByCode };
