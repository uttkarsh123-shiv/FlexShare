const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { getS3Client, getBucket } = require('../config/s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

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

const getPresignedUrl = async (key, filename) => {
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ResponseContentDisposition: `attachment; filename="${filename}"`,
  });
  return getSignedUrl(getS3Client(), command, { expiresIn: 3600 });
};

module.exports = { uploadToS3, getPresignedUrl };
