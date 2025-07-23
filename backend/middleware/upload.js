// const multer = require('multer');
// const path = require('path');

// const storage = multer.diskStorage({
//     destination: 'uploads/',
//     filename: (req,file,cb) => {
//         const ext = path.extname(file.originalname);
//         cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
//     }
// })

// const upload = multer({ storage });
// module.exports = upload;

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // ⬅️ 15MB limit
  }
});

module.exports = upload;
