const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { getS3Client, getBucket } = require('../config/s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const getMimeType = (ext) => {
  const map = {
    '.pdf':  'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc':  'application/msword',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls':  'application/vnd.ms-excel',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.ppt':  'application/vnd.ms-powerpoint',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif':  'image/gif',
    '.bmp':  'image/bmp',
    '.avif': 'image/avif',
    '.txt':  'text/plain',
    '.csv':  'text/csv',
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
};

const uploadToS3 = async (buffer, originalName, folder = 'uploads') => {
  const ext = path.extname(originalName);
  const key = `${folder}/${uuidv4()}${ext}`;

  await getS3Client().send(new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    Body: buffer,
    ContentType: getMimeType(ext),
  }));

  return key;
};

// Upload directly from a file path — avoids loading large files into memory
const uploadFileToS3 = async (filePath, originalName, folder = 'uploads') => {
  const ext = path.extname(originalName);
  const key = `${folder}/${uuidv4()}${ext}`;

  const fileStream = fs.createReadStream(filePath);
  const fileSize = fs.statSync(filePath).size;

  await getS3Client().send(new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    Body: fileStream,
    ContentLength: fileSize,
    ContentType: getMimeType(ext),
  }));

  return key;
};

// Download an S3 object and return as a Buffer
const downloadFromS3 = async (key) => {
  const command = new GetObjectCommand({ Bucket: getBucket(), Key: key });
  const response = await getS3Client().send(command);

  return new Promise((resolve, reject) => {
    const chunks = [];
    response.Body.on('data', (chunk) => chunks.push(chunk));
    response.Body.on('end', () => resolve(Buffer.concat(chunks)));
    response.Body.on('error', reject);
  });
};

// Delete an object from S3
const deleteFromS3 = async (key) => {
  await getS3Client().send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }));
};

const getPresignedUrl = async (key, filename) => {
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ResponseContentDisposition: `attachment; filename="${filename}"`,
  });
  return getSignedUrl(getS3Client(), command, { expiresIn: 3600 });
};

module.exports = { uploadToS3, uploadFileToS3, downloadFromS3, deleteFromS3, getPresignedUrl };
