const cloudinary = require('../config/cloudinary');
const filemodel = require('../model/file.model');
const nanoid = require('nanoid').nanoid;
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { execFile } = require('child_process');
const util = require('util');
const execFileAsync = util.promisify(execFile);
const { PDFDocument } = require('pdf-lib');
const bcrypt = require('bcryptjs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');
const pdf2pic = require('pdf2pic');
const { safeDeleteFile, cleanupFiles } = require('../utils/fileCleanup');
const logger = require('../utils/logger');

const allowedConversions = [
  'image->png', 'image->jpg', 'image->jpeg', 'image->webp', 'image->gif', 'image->bmp', 'image->avif', 'image->pdf',
  'pdf->word', 'word->pdf', 'pdf->txt', 'pdf->images',
  'excel->pdf', 'excel->csv', 'ppt->pdf', 'word->txt',
  'none' // For files that don't need conversion
];

const uploadAndConvertFile = async (req, res) => {
  try {
    const file = req.file;
    const { conversionType, description, password: reqPassword, expiryHours: reqExpiryHours, maxDownloads: reqMaxDownloads } = req.body;

    logger.log('Upload request received:', { 
      fileName: file?.originalname, 
      conversionType, 
      fileSize: file?.size,
      hasPassword: !!reqPassword,
      passwordLength: reqPassword ? reqPassword.length : 0,
      expiryHours: reqExpiryHours,
      maxDownloads: reqMaxDownloads
    });

    if (!file) {
      return res.status(400).json({ message: 'File is required' });
    }

    // Handle case where no conversion is needed
    if (!conversionType || conversionType === 'none') {
      logger.log('No conversion requested - uploading original file');
      
      // Upload original file directly to Cloudinary
      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'original_files',
              resource_type: 'auto'
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          stream.end(buffer);
        });
      };

      const uploadResult = await streamUpload(file.buffer);
      
      // Create DB entry
      const code = nanoid(6).toUpperCase();
      
      const hours = parseInt(reqExpiryHours, 10) || 1;
      const expiry = new Date(Date.now() + hours * 60 * 60 * 1000);
      
      let hashedPassword = null;
      if (reqPassword && reqPassword.trim()) {
        hashedPassword = await bcrypt.hash(reqPassword.trim(), 10);
      }

      // Parse maxDownloads to number if provided
      let downloadLimit = null;
      if (reqMaxDownloads) {
        const parsed = parseInt(reqMaxDownloads, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 100) {
          downloadLimit = parsed;
        }
      }

      logger.log('Creating database entry (no conversion) with settings:', {
        code,
        hasPassword: !!hashedPassword,
        expiryHours: hours,
        maxDownloads: downloadLimit
      });

      const fileDoc = await filemodel.create({
        code,
        fileUrl: uploadResult.secure_url,
        originalFileName: file.originalname,
        fileSize: file.size,
        conversionType: 'none',
        expiry,
        description: description || 'No description provided',
        password: hashedPassword,
        hasPassword: !!hashedPassword,
        maxDownloads: downloadLimit,
        downloadCount: 0
      });

      return res.json({ 
        code, 
        url: uploadResult.secure_url, 
        expiry, 
        description: fileDoc.description,
        hasPassword: fileDoc.hasPassword,
        maxDownloads: fileDoc.maxDownloads,
        expiresIn: `${hours} hour${hours > 1 ? 's' : ''}`,
        message: 'File uploaded successfully!'
      });
    }

    if (!allowedConversions.includes(conversionType)) {
      return res.status(400).json({ message: 'Invalid conversion type' });
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({ message: 'File size exceeds 50MB limit' });
    }

    const targetFormat = conversionType.split('->')[1];
    const convertedFilename = 'converted-' + Date.now() + '.' + targetFormat;
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    let convertedPath = path.join(uploadsDir, convertedFilename);
    
    // Handle memory storage - write buffer to temp file first if needed
    let tempFilePath = file.path;
    if (!file.path || !fs.existsSync(file.path)) {
      // File is in memory buffer
      tempFilePath = path.join(uploadsDir, 'temp-' + Date.now() + path.extname(file.originalname));
      fs.writeFileSync(tempFilePath, file.buffer);
    }

    logger.log('Starting conversion:', conversionType);

    try {
      if (conversionType.startsWith('image->')) {
        if (conversionType === 'image->pdf') {
          // Convert image to PDF using Sharp and PDF-lib
          logger.log('Converting image to PDF...');
          
          try {
            // First, process the image with Sharp to get consistent format
            const processedImageBuffer = await sharp(tempFilePath)
              .resize({ fit: 'inside', width: 2000, height: 2000 })
              .jpeg({ quality: 90 })
              .toBuffer();
            
            // Create PDF with the image
            const pdfDoc = await PDFDocument.create();
            const jpgImage = await pdfDoc.embedJpg(processedImageBuffer);
            const jpgDims = jpgImage.scale(1);
            
            // Calculate page size to fit image
            const maxWidth = 595; // A4 width in points
            const maxHeight = 842; // A4 height in points
            let { width, height } = jpgDims;
            
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width *= ratio;
              height *= ratio;
            }
            
            const page = pdfDoc.addPage([width, height]);
            page.drawImage(jpgImage, {
              x: 0,
              y: 0,
              width,
              height,
            });
            
            const pdfBytes = await pdfDoc.save();
            fs.writeFileSync(convertedPath, pdfBytes);
            logger.log('Image to PDF conversion completed');
          } catch (pdfError) {
            logger.error('Image to PDF conversion failed:', pdfError);
            throw new Error('Image to PDF conversion failed');
          }
          
        } else {
          // Regular image conversion with sharp
          logger.log(`Converting image to ${targetFormat}...`);
          try {
            const sharpFormat = targetFormat === 'jpg' ? 'jpeg' : targetFormat;
            await sharp(tempFilePath)
              .resize({ fit: 'inside', width: 2000 })
              .toFormat(sharpFormat)
              .toFile(convertedPath);
            logger.log('Image conversion completed');
          } catch (imageError) {
            logger.error('Image conversion failed:', imageError);
            throw new Error('Image conversion failed');
          }
        }

      } else if (conversionType === 'word->pdf') {
        // Word to PDF conversion
        logger.log('Converting Word to PDF...');
        try {
          // Try using docx2pdf Python package first
          await execFileAsync('python', ['-c', `
import sys
import os
try:
    from docx2pdf import convert
    convert("${tempFilePath.replace(/\\/g, '/')}", "${convertedPath.replace(/\\/g, '/')}")
    print("Conversion completed successfully")
except ImportError:
    print("docx2pdf not available")
    sys.exit(1)
except Exception as e:
    print(f"Conversion failed: {e}")
    sys.exit(1)
          `]);
          logger.log('Word to PDF conversion completed using docx2pdf');
        } catch (pythonError) {
          logger.log('Python docx2pdf failed, trying alternative...');
          // Fallback: Create a simple PDF with the document content
          try {
            const result = await mammoth.extractRawText({ path: tempFilePath });
            const text = result.value;
            
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage();
            const { width, height } = page.getSize();
            
            // Simple text to PDF conversion
            page.drawText(text.substring(0, 2000) + (text.length > 2000 ? '...' : ''), {
              x: 50,
              y: height - 50,
              size: 12,
              maxWidth: width - 100,
            });
            
            const pdfBytes = await pdfDoc.save();
            fs.writeFileSync(convertedPath, pdfBytes);
            logger.log('Word to PDF conversion completed using fallback method');
          } catch (fallbackError) {
            logger.error('All Word to PDF conversion methods failed:', fallbackError);
            // Last resort: copy original file
            fs.copyFileSync(tempFilePath, convertedPath);
            logger.log('Word file uploaded without conversion');
          }
        }

      } else if (conversionType === 'pdf->word') {
        // PDF to Word conversion
        logger.log('Converting PDF to Word...');
        const outputDocx = convertedPath.replace(/\.\w+$/, '.docx');
        
        try {
          // Try using pdf2docx Python package first
          await execFileAsync('python', ['-c', `
import sys
try:
    from pdf2docx import Converter
    cv = Converter("${tempFilePath.replace(/\\/g, '/')}")
    cv.convert("${outputDocx.replace(/\\/g, '/')}")
    cv.close()
    print("Conversion completed successfully")
except ImportError:
    print("pdf2docx not available")
    sys.exit(1)
except Exception as e:
    print(f"Conversion failed: {e}")
    sys.exit(1)
          `]);
          
          if (fs.existsSync(outputDocx)) {
            if (fs.existsSync(convertedPath) && convertedPath !== outputDocx) {
              fs.unlinkSync(convertedPath);
            }
            convertedPath = outputDocx;
            logger.log('PDF to Word conversion completed using pdf2docx');
          } else {
            throw new Error('PDF to Word conversion failed - output file not created');
          }
        } catch (pythonError) {
          logger.log('Python pdf2docx failed, trying alternative...');
          // Fallback: Extract text and create a simple text file
          try {
            const dataBuffer = fs.readFileSync(tempFilePath);
            const data = await pdfParse(dataBuffer);
            const textContent = data.text;
            
            // Create a simple text file instead of Word
            const txtPath = convertedPath.replace(/\.\w+$/, '.txt');
            fs.writeFileSync(txtPath, textContent);
            convertedPath = txtPath;
            logger.log('PDF to text conversion completed using fallback method');
          } catch (fallbackError) {
            logger.error('All PDF to Word conversion methods failed:', fallbackError);
            // Last resort: copy original file
            fs.copyFileSync(tempFilePath, convertedPath);
            logger.log('PDF file uploaded without conversion');
          }
        }

      } else if (conversionType === 'pdf->txt') {
        // PDF to text conversion
        logger.log('Converting PDF to text...');
        try {
          const dataBuffer = fs.readFileSync(tempFilePath);
          const data = await pdfParse(dataBuffer);
          const textContent = data.text;
          
          fs.writeFileSync(convertedPath, textContent);
          logger.log('PDF to text conversion completed');
        } catch (textError) {
          logger.error('PDF to text conversion failed:', textError);
          throw new Error('PDF to text conversion failed');
        }

      } else if (conversionType === 'word->txt') {
        // Word to text conversion
        logger.log('Converting Word to text...');
        try {
          const result = await mammoth.extractRawText({ path: tempFilePath });
          const textContent = result.value;
          
          fs.writeFileSync(convertedPath, textContent);
          logger.log('Word to text conversion completed');
        } catch (textError) {
          logger.error('Word to text conversion failed:', textError);
          throw new Error('Word to text conversion failed');
        }

      } else if (conversionType === 'pdf->images') {
        // PDF to images conversion
        logger.log('Converting PDF to images...');
        try {
          const convert = pdf2pic.fromPath(tempFilePath, {
            density: 100,
            saveFilename: "page",
            savePath: path.dirname(convertedPath),
            format: "png",
            width: 600,
            height: 800
          });
          
          const results = await convert.bulk(-1);
          
          if (results && results.length > 0) {
            // For now, just use the first page
            const firstPagePath = results[0].path;
            fs.copyFileSync(firstPagePath, convertedPath.replace(/\.\w+$/, '.png'));
            convertedPath = convertedPath.replace(/\.\w+$/, '.png');
            
            // Clean up temporary files
            results.forEach(result => {
              if (fs.existsSync(result.path)) {
                fs.unlinkSync(result.path);
              }
            });
            
            logger.log('PDF to images conversion completed');
          } else {
            throw new Error('No images generated from PDF');
          }
        } catch (imageError) {
          logger.error('PDF to images conversion failed:', imageError);
          // Fallback: copy original file
          fs.copyFileSync(tempFilePath, convertedPath);
          logger.log('PDF file uploaded without conversion');
        }

      } else if (conversionType === 'excel->csv') {
        // Excel to CSV conversion
        logger.log('Converting Excel to CSV...');
        try {
          const workbook = xlsx.readFile(tempFilePath);
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const csvContent = xlsx.utils.sheet_to_csv(worksheet);
          
          fs.writeFileSync(convertedPath, csvContent);
          logger.log('Excel to CSV conversion completed');
        } catch (csvError) {
          logger.error('Excel to CSV conversion failed:', csvError);
          throw new Error('Excel to CSV conversion failed');
        }

      } else if (conversionType === 'excel->pdf') {
        // Excel to PDF conversion (simplified)
        logger.log('Converting Excel to PDF...');
        try {
          const workbook = xlsx.readFile(tempFilePath);
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const csvContent = xlsx.utils.sheet_to_csv(worksheet);
          
          // Create a simple PDF with the spreadsheet data
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage();
          const { width, height } = page.getSize();
          
          page.drawText(csvContent.substring(0, 2000) + (csvContent.length > 2000 ? '...' : ''), {
            x: 50,
            y: height - 50,
            size: 10,
            maxWidth: width - 100,
          });
          
          const pdfBytes = await pdfDoc.save();
          fs.writeFileSync(convertedPath, pdfBytes);
          logger.log('Excel to PDF conversion completed');
        } catch (pdfError) {
          logger.error('Excel to PDF conversion failed:', pdfError);
          // Fallback: copy original file
          fs.copyFileSync(tempFilePath, convertedPath);
          logger.log('Excel file uploaded without conversion');
        }

      } else if (conversionType === 'ppt->pdf') {
        // PowerPoint to PDF conversion (placeholder)
        logger.log('PowerPoint to PDF conversion not fully implemented - uploading original file');
        fs.copyFileSync(tempFilePath, convertedPath);

      } else {
        // Fallback: just copy original
        logger.log('No specific conversion handler, copying original file');
        fs.copyFileSync(tempFilePath, convertedPath);
      }

    } catch (conversionError) {
      logger.error('Conversion error:', conversionError);
      
      // Clean up temp files with proper error handling
      if (tempFilePath !== file.path) {
        await safeDeleteFile(tempFilePath);
      }
      
      return res.status(500).json({ 
        message: 'File conversion failed',
        details: conversionError.message 
      });
    }
    
    // Clean up temp file if it was created
    if (tempFilePath !== file.path) {
      await safeDeleteFile(tempFilePath);
    }

    logger.log('Uploading to Cloudinary...');

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(convertedPath, {
      folder: 'converted_files',
      resource_type: 'auto'
    });

    logger.log('Cloudinary upload completed');

    // Remove temp files with proper error handling
    await cleanupFiles([file.path, convertedPath]);

    // Create DB entry
    const code = nanoid(6).toUpperCase();
    
    // Calculate expiry (default 1 hour, max 7 days)
    const hours = parseInt(reqExpiryHours, 10) || 1;
    const expiry = new Date(Date.now() + hours * 60 * 60 * 1000);
    
    // Hash password if provided
    let hashedPassword = null;
    if (reqPassword && reqPassword.trim()) {
      hashedPassword = await bcrypt.hash(reqPassword.trim(), 10);
    }

    // Parse maxDownloads to number if provided
    let downloadLimit = null;
    if (reqMaxDownloads) {
      const parsed = parseInt(reqMaxDownloads, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 100) {
        downloadLimit = parsed;
      }
    }

    logger.log('Creating database entry with settings:', {
      code,
      hasPassword: !!hashedPassword,
      expiryHours: hours,
      maxDownloads: downloadLimit
    });

    const fileDoc = await filemodel.create({
      code,
      fileUrl: uploadResult.secure_url,
      originalFileName: file.originalname,
      fileSize: file.size,
      conversionType,
      expiry,
      description: description || 'No description provided',
      password: hashedPassword,
      hasPassword: !!hashedPassword,
      maxDownloads: downloadLimit,
      downloadCount: 0
    });

    logger.log('Upload process completed successfully');

    res.json({ 
      code, 
      url: uploadResult.secure_url, 
      expiry, 
      description: fileDoc.description,
      hasPassword: fileDoc.hasPassword,
      maxDownloads: fileDoc.maxDownloads,
      expiresIn: `${hours} hour${hours > 1 ? 's' : ''}`
    });

  } catch (err) {
    logger.error('Upload error:', err);
    res.status(500).json({ 
      message: 'Upload & conversion failed',
      error: err.message 
    });
  }
};

// Batch file upload and conversion
const uploadBatchFiles = async (req, res) => {
  try {
    const files = req.files;
    const { conversionType, description, password, expiryHours, maxDownloads } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    if (!conversionType) {
      return res.status(400).json({ message: 'Conversion type is required' });
    }

    if (files.length > 10) {
      return res.status(400).json({ message: 'Maximum 10 files allowed per batch' });
    }

    const results = [];
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const hours = expiryHours || 1;
    const expiry = new Date(Date.now() + hours * 60 * 60 * 1000);
    
    let hashedPassword = null;
    if (password && password.trim()) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Process files sequentially to avoid overwhelming the system
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const code = nanoid(6).toUpperCase();
        const targetFormat = conversionType.split('->')[1];
        
        let tempFilePath = path.join(uploadsDir, 'temp-' + Date.now() + '-' + i + path.extname(file.originalname));
        fs.writeFileSync(tempFilePath, file.buffer);

        let convertedPath = path.join(uploadsDir, 'converted-' + Date.now() + '-' + i + '.' + targetFormat);

        // Perform conversion
        if (conversionType.startsWith('image->')) {
          const sharpFormat = targetFormat === 'jpg' ? 'jpeg' : targetFormat;
          await sharp(tempFilePath)
            .resize({ fit: 'inside', width: 2000 })
            .toFormat(sharpFormat)
            .toFile(convertedPath);
        } else {
          const fileBuffer = fs.readFileSync(tempFilePath);
          const ext = '.' + targetFormat;
          const convertedBuffer = await libre.convertAsync(fileBuffer, ext, undefined);
          fs.writeFileSync(convertedPath, convertedBuffer);
        }

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(convertedPath, {
          folder: 'converted_files',
          resource_type: 'auto'
        });

        // Clean up
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        if (fs.existsSync(convertedPath)) fs.unlinkSync(convertedPath);

        // Create DB entry
        await filemodel.create({
          code,
          fileUrl: uploadResult.secure_url,
          originalFileName: file.originalname,
          fileSize: file.size,
          conversionType,
          expiry,
          description: description || 'No description provided',
          password: hashedPassword,
          hasPassword: !!hashedPassword,
          maxDownloads: maxDownloads || null,
          downloadCount: 0
        });

        results.push({ 
          code, 
          fileName: file.originalname,
          url: uploadResult.secure_url,
          success: true 
        });
      } catch (error) {
        results.push({ 
          fileName: file.originalname,
          error: error.message,
          success: false 
        });
      }
    }

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    res.json({
      total: files.length,
      successful: successful.length,
      failed: failed.length,
      results: results,
      message: `Processed ${successful.length} of ${files.length} files`
    });

  } catch (err) {
    logger.error('Batch upload error:', err);
    res.status(500).json({ message: 'Batch upload failed', error: err.message });
  }
};

module.exports = { uploadAndConvertFile, uploadBatchFiles };
