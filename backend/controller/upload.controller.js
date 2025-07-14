const cloudinary = require('../config/cloudinary');
const filemodel = require('../model/file.model');
const { nanoid } = require('nanoid');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// allowed conversions
const allowedConversions = [
  'image->png', 'image->jpg', 'image->jpeg', 'image->webp',
  'pdf->word', 'word->pdf'
];

const uploadAndConvertFile = async (req, res) => {
  try {
    const file = req.file;
    const { conversionType } = req.body;

    if (!file || !conversionType) {
      return res.status(400).json({ message: 'File and conversion type required' });
    }

    if (!allowedConversions.includes(conversionType)) {
      return res.status(400).json({ message: 'Invalid conversion type' });
    }

    // ✨ Step 1: do local conversion
    const convertedFilename = 'converted-' + Date.now() + path.extname(file.originalname);
    const convertedPath = path.join('uploads', convertedFilename);

    if (conversionType.startsWith('image->')) {
      const targetFormat = conversionType.split('->')[1]; // png, jpg, webp etc.
      await sharp(file.path)
        .toFormat(targetFormat)
        .toFile(convertedPath);
    } else {
      // pdf->word or word->pdf: dummy copy file, you can replace with real logic
      fs.copyFileSync(file.path, convertedPath);
    }

    // ✈ Step 2: upload converted file to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(convertedPath, {
        folder: 'converted_files', 
        resource_type: 'auto'
    });

    // 🧹 Step 3: cleanup temp files
    fs.unlinkSync(file.path);
    fs.unlinkSync(convertedPath);

    // 🪙 Step 4: generate code + expiry
    const code = nanoid(6).toUpperCase();
    const expiry = new Date(Date.now() + 2 * 60 * 60 * 1000);

    // 📦 Step 5: save to DB
    await filemodel.create({
      code,
      fileUrl: uploadResult.secure_url,
      conversionType,
      expiry
    });

    res.json({ code, url: uploadResult.secure_url, expiry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload & conversion failed' });
  }
};


module.exports = { uploadAndConvertFile };