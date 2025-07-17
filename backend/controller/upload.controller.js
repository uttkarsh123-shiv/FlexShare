const cloudinary = require('../config/cloudinary');
const filemodel = require('../model/file.model');
const nanoid = require('nanoid').nanoid;
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { execFile } = require('child_process');
const util = require('util');
const execFileAsync = util.promisify(execFile);

const allowedConversions = [
  'image->png', 'image->jpg', 'image->jpeg', 'image->webp',
  'pdf->word', 'word->pdf'
];

const uploadAndConvertFile = async (req, res) => {
  try {
    const file = req.file;
    const { conversionType, description } = req.body;

    if (!file || !conversionType) {
      return res.status(400).json({ message: 'File and conversion type required' });
    }

    if (!allowedConversions.includes(conversionType)) {
      return res.status(400).json({ message: 'Invalid conversion type' });
    }

    const targetFormat = conversionType.split('->')[1];
    const convertedFilename = 'converted-' + Date.now() + '.' + targetFormat;
    const convertedPath = path.join('uploads', convertedFilename);

    if (conversionType.startsWith('image->')) {
      // Image conversion with sharp
      await sharp(file.path)
        .toFormat(targetFormat)
        .toFile(convertedPath);

    } 
     else {
      // fallback: just copy original
      fs.copyFileSync(file.path, convertedPath);
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(convertedPath, {
      folder: 'converted_files',
      resource_type: 'auto'
    });

    // Remove temp files
    fs.unlinkSync(file.path);
    fs.unlinkSync(convertedPath);

    // Create DB entry
    const code = nanoid(6).toUpperCase();
    const expiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 2 hours

    await filemodel.create({
      code,
      fileUrl: uploadResult.secure_url,
      conversionType,
      expiry,
        description: description || 'file description'
    });

    res.json({ code, url: uploadResult.secure_url, expiry, description });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload & conversion failed' });
  }
};

module.exports = { uploadAndConvertFile };
