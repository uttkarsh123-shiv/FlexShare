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
  .resize({ fit: 'inside', width: 2000 }) // Optional resize
  .toFormat(targetFormat, { quality: 70 }) // ⬅️ Add quality here
  .toFile(convertedPath);


    } 
     else {
      // fallback: just copy original
      fs.copyFileSync(file.path, convertedPath);
    }

    // Upload to Cloudinary
    // const uploadResult = await cloudinary.uploader.upload(convertedPath, {
    //   folder: 'converted_files',
    //   resource_type: 'auto'
    // });

    const stats = fs.statSync(convertedPath);
console.log('Converted file size (MB):', stats.size / (1024 * 1024));

    let uploadResult;
try {
  uploadResult = await cloudinary.uploader.upload(convertedPath, {
    folder: 'converted_files',
    resource_type: "auto", 
  });
  console.log("Cloudinary upload success:", uploadResult.secure_url);
} catch (err) {
  console.error("Cloudinary upload failed:", err);
  return res.status(500).json({ error: "Cloudinary upload failed" });
}


    // Remove temp files
  try {
  fs.unlinkSync(file.path);
  console.log("Original file deleted:", file.path);
  fs.unlinkSync(convertedPath);
  console.log("Converted file deleted:", convertedPath);
} catch (err) {
  console.error("File deletion failed:", err);
}


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
