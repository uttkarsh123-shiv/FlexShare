// import multer, { diskStorage } from 'multer';
// import { extname } from 'path';

const multer = require('multer');
const { diskStorage } = require('multer');
const { extname } = require('path');

const storage = diskStorage({
    destination: 'uploads/',
    filename: (req,file,cb) => {
        const ext = extname(file.originalname);
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
    }
})

const upload = multer({
  storage: multer.memoryStorage(), // or diskStorage
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// const upload = multer({ storage });
module.exports = upload;