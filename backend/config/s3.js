const { S3Client } = require('@aws-sdk/client-s3');

const getS3Client = () => new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const getBucket = () => {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) throw new Error('AWS_S3_BUCKET env var is not set');
  return bucket;
};

module.exports = { getS3Client, getBucket };
