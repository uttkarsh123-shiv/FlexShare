const express = require('express');
const router = express.Router();
const upload = require("../middleware/upload").default
const {uploadAndConvertFile}   = require('../controller/upload.controller');

router.post('/uploads', upload.single('file'), uploadAndConvertFile);

module.exports = router;