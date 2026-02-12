const cloudinary = require('../config/cloudinary');
const filemodel = require('../model/file.model');
const { nanoid, customAlphabet } = require('nanoid');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');
const bcrypt = require('bcryptjs');
const { safeDeleteFile, cleanupFiles } = require('../utils/fileCleanup');
const logger = require('../utils/logger');
const LibreOfficeConverter = require('../utils/libreofficeConverter');

// Create custom nanoid that only uses alphanumeric characters (no symbols)
const generateCode = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

// Helper function to get the correct filename after conversion
const getConvertedFileName = (originalName, conversionType) => {
  if (!conversionType || conversionType === 'none') {
    return originalName;
  }
  
  // Extract the base name without extension
  const baseName = path.parse(originalName).name;
  const targetFormat = conversionType.split('->')[1];
  
  // Map conversion types to actual file extensions
  const extensionMap = {
    'word': 'docx',  // pdf->word should be .docx
    'txt': 'txt',
    'pdf': 'pdf',
    'png': 'png',
    'jpg': 'jpg',
    'jpeg': 'jpeg',
    'webp': 'webp',
    'gif': 'gif',
    'bmp': 'bmp',
    'avif': 'avif',
    'csv': 'csv'
  };
  
  const actualExtension = extensionMap[targetFormat] || targetFormat;
  
  // Return new filename with correct extension
  return `${baseName}.${actualExtension}`;
};

const allowedConversions = [
  'image->png', 'image->jpg', 'image->jpeg', 'image->webp', 'image->gif', 'image->bmp', 'image->avif', 'image->pdf',
  'pdf->word', 'word->pdf', 'pdf->txt',
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

    // Validate file size FIRST (10MB max for Cloudinary free tier)
    const maxSize = 10 * 1024 * 1024; // 10MB limit due to Cloudinary free tier
    if (file.size > maxSize) {
      return res.status(400).json({ 
        message: 'File size exceeds 10MB limit (Cloudinary free tier restriction)',
        details: `File size: ${(file.size / 1024 / 1024).toFixed(2)}MB, Maximum allowed: 10MB`
      });
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
              resource_type: 'auto',
              timeout: 120000,
              invalidate: true
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
      const code = generateCode();
      
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
        originalFileName: getConvertedFileName(file.originalname, 'none'),
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
      logger.log(`Wrote temp file: ${tempFilePath} (${file.buffer.length} bytes)`);
    } else {
      logger.log(`Using existing file path: ${tempFilePath}`);
    }
    
    // Verify temp file exists and is readable
    if (!fs.existsSync(tempFilePath)) {
      throw new Error('Temp file was not created successfully');
    }
    
    const tempFileStats = fs.statSync(tempFilePath);
    logger.log(`Temp file verified: ${tempFileStats.size} bytes`);

    logger.log('Starting conversion:', conversionType);

    try {
      if (conversionType.startsWith('image->')) {
        if (conversionType === 'image->pdf') {
          // Convert image to PDF using Sharp and PDF-lib
          logger.log('Converting image to PDF...');
          
          try {
            // Process image with Sharp - optimized settings
            const processedImageBuffer = await sharp(tempFilePath)
              .resize({ fit: 'inside', width: 2000, height: 2000, withoutEnlargement: true })
              .jpeg({ quality: 85, progressive: true }) // Reduced quality for speed
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
          // Regular image conversion with sharp - optimized
          logger.log(`Converting image to ${targetFormat}...`);
          try {
            const sharpFormat = targetFormat === 'jpg' ? 'jpeg' : targetFormat;
            const sharpInstance = sharp(tempFilePath)
              .resize({ fit: 'inside', width: 2000, withoutEnlargement: true });
            
            // Format-specific optimizations
            switch (sharpFormat) {
              case 'jpeg':
                sharpInstance.jpeg({ quality: 85, progressive: true });
                break;
              case 'png':
                sharpInstance.png({ compressionLevel: 6 }); // Balanced compression
                break;
              case 'webp':
                sharpInstance.webp({ quality: 85 });
                break;
              case 'avif':
                sharpInstance.avif({ quality: 85 });
                break;
              default:
                sharpInstance.toFormat(sharpFormat);
            }
            
            await sharpInstance.toFile(convertedPath);
            logger.log('Image conversion completed');
          } catch (imageError) {
            logger.error('Image conversion failed:', imageError);
            throw new Error('Image conversion failed');
          }
        }

      } else if (['word->pdf', 'pdf->word', 'excel->pdf', 'ppt->pdf', 'word->txt', 'excel->csv', 'pdf->txt'].includes(conversionType)) {
        // Document conversions using LibreOffice
        logger.log(`Converting document using LibreOffice: ${conversionType}`);
        
        try {
          // Check if LibreOffice is available
          const isLibreOfficeAvailable = await LibreOfficeConverter.isAvailable();
          
          if (!isLibreOfficeAvailable) {
            throw new Error('LibreOffice is not installed or not available in PATH');
          }
          
          // Verify input file before conversion
          if (!fs.existsSync(tempFilePath)) {
            throw new Error('Input file not found before conversion');
          }
          
          const inputStats = fs.statSync(tempFilePath);
          logger.log(`Input file size: ${inputStats.size} bytes`);
          
          if (inputStats.size === 0) {
            throw new Error('Input file is empty');
          }
          
          // Use LibreOffice for conversion
          const outputDir = path.dirname(convertedPath);
          const convertedFilePath = await LibreOfficeConverter.convertWithFallback(
            tempFilePath, 
            outputDir, 
            conversionType
          );
          
          // Verify output file
          if (!fs.existsSync(convertedFilePath)) {
            throw new Error('Conversion completed but output file not found');
          }
          
          const outputStats = fs.statSync(convertedFilePath);
          logger.log(`Output file size: ${outputStats.size} bytes`);
          
          if (outputStats.size === 0) {
            throw new Error('Conversion produced an empty file');
          }
          
          // For PDF files, do additional validation
          if (convertedFilePath.endsWith('.pdf')) {
            const pdfBuffer = fs.readFileSync(convertedFilePath);
            const header = pdfBuffer.toString('utf8', 0, 10);
            logger.log(`PDF header check: ${header}`);
            
            if (!header.includes('%PDF')) {
              logger.error('Invalid PDF - dumping first 100 bytes:', pdfBuffer.toString('hex', 0, 100));
              throw new Error('LibreOffice produced an invalid PDF file');
            }
            
            logger.log('PDF validation passed');
          }
          
          // Update convertedPath to the actual output file
          convertedPath = convertedFilePath;
          logger.log(`LibreOffice conversion completed: ${convertedPath}`);
          
        } catch (libreOfficeError) {
          logger.error('LibreOffice conversion failed:', libreOfficeError);
          logger.error('Error stack:', libreOfficeError.stack);
          
          // Fallback to legacy methods for specific conversions
          if (conversionType === 'pdf->txt') {
            logger.log('Using fallback PDF to text conversion...');
            try {
              const { PDFParse } = require('pdf-parse');
              const dataBuffer = fs.readFileSync(tempFilePath);
              const parser = new PDFParse({ data: dataBuffer });
              const result = await parser.getText();
              
              // Extract text from all pages
              let content = '';
              if (result.pages && Array.isArray(result.pages)) {
                content = result.pages.map(page => page.text).join('\n\n');
              } else if (result.text) {
                content = result.text;
              }
              
              fs.writeFileSync(convertedPath, content);
              logger.log('Fallback PDF to text conversion completed');
            } catch (fallbackError) {
              logger.error('Fallback PDF to text conversion failed:', fallbackError);
              throw new Error('PDF to text conversion failed');
            }
          } else {
            // For other document conversions, throw the error
            throw new Error(`Document conversion failed: ${libreOfficeError.message}`);
          }
        }

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

    // Verify converted file exists and is valid before uploading
    if (!fs.existsSync(convertedPath)) {
      throw new Error('Conversion completed but output file not found');
    }
    
    const convertedStats = fs.statSync(convertedPath);
    logger.log(`Converted file ready for upload: ${convertedPath} (${convertedStats.size} bytes)`);
    
    if (convertedStats.size === 0) {
      throw new Error('Converted file is empty');
    }
    
    // For PDF files, validate the header one more time before upload
    if (convertedPath.endsWith('.pdf')) {
      const pdfBuffer = fs.readFileSync(convertedPath);
      const header = pdfBuffer.toString('utf8', 0, 10);
      if (!header.includes('%PDF')) {
        logger.error(`Invalid PDF header before upload: ${header}`);
        logger.error('First 200 bytes:', pdfBuffer.toString('hex', 0, 200));
        throw new Error('PDF file is corrupted before upload');
      }
      logger.log('PDF file validated successfully before upload');
    }

    logger.log('Uploading to Cloudinary...');

    // Upload to Cloudinary with proper resource type
    let uploadResult;
    try {
      // Determine resource type based on file
      const resourceType = convertedPath.endsWith('.pdf') || 
                          convertedPath.endsWith('.docx') || 
                          convertedPath.endsWith('.doc') ? 'raw' : 'auto';
      
      logger.log(`Uploading as resource type: ${resourceType}`);
      
      // Read file into buffer to ensure it's not deleted during upload
      const fileBuffer = fs.readFileSync(convertedPath);
      logger.log(`File buffer size: ${fileBuffer.length} bytes`);
      
      // Upload using buffer instead of file path
      uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'converted_files',
            resource_type: resourceType,
            timeout: 120000,
            use_filename: true,
            unique_filename: true,
            // Remove access_mode and type - let Cloudinary use defaults
            invalidate: true // Invalidate CDN cache
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        stream.end(fileBuffer);
      });
      
      logger.log('Cloudinary upload completed:', {
        url: uploadResult.secure_url,
        size: uploadResult.bytes,
        format: uploadResult.format
      });
      
    } catch (uploadError) {
      logger.error('Cloudinary upload failed:', uploadError);
      throw new Error(`Failed to upload to Cloudinary: ${uploadError.message}`);
    }

    // Remove temp files AFTER successful upload
    await cleanupFiles([file.path, convertedPath]);

    // Create DB entry
    const code = generateCode();
    
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
      originalFileName: getConvertedFileName(file.originalname, conversionType),
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
        const code = generateCode();
        const targetFormat = conversionType.split('->')[1];
        
        let tempFilePath = path.join(uploadsDir, 'temp-' + Date.now() + '-' + i + path.extname(file.originalname));
        fs.writeFileSync(tempFilePath, file.buffer);

        let convertedPath = path.join(uploadsDir, 'converted-' + Date.now() + '-' + i + '.' + targetFormat);

        // Perform conversion
        if (conversionType.startsWith('image->')) {
          // Use Sharp for image conversions
          if (conversionType === 'image->pdf') {
            // Convert image to PDF using Sharp and PDF-lib
            const processedImageBuffer = await sharp(tempFilePath)
              .resize({ fit: 'inside', width: 2000, height: 2000 })
              .jpeg({ quality: 90 })
              .toBuffer();
            
            const pdfDoc = await PDFDocument.create();
            const jpgImage = await pdfDoc.embedJpg(processedImageBuffer);
            const jpgDims = jpgImage.scale(1);
            
            const maxWidth = 595;
            const maxHeight = 842;
            let { width, height } = jpgDims;
            
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width *= ratio;
              height *= ratio;
            }
            
            const page = pdfDoc.addPage([width, height]);
            page.drawImage(jpgImage, { x: 0, y: 0, width, height });
            
            const pdfBytes = await pdfDoc.save();
            fs.writeFileSync(convertedPath, pdfBytes);
          } else {
            // Regular image conversion
            const sharpFormat = targetFormat === 'jpg' ? 'jpeg' : targetFormat;
            await sharp(tempFilePath)
              .resize({ fit: 'inside', width: 2000 })
              .toFormat(sharpFormat)
              .toFile(convertedPath);
          }
        } else if (['word->pdf', 'pdf->word', 'excel->pdf', 'ppt->pdf', 'word->txt', 'excel->csv', 'pdf->txt'].includes(conversionType)) {
          // Use LibreOffice for document conversions
          const outputDir = path.dirname(convertedPath);
          const convertedFilePath = await LibreOfficeConverter.convertWithFallback(
            tempFilePath, 
            outputDir, 
            conversionType
          );
          convertedPath = convertedFilePath;
        } else {
          // Fallback: copy original file
          fs.copyFileSync(tempFilePath, convertedPath);
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
          originalFileName: getConvertedFileName(file.originalname, conversionType),
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
