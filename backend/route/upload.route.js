const express = require('express');
const router = express.Router();
const upload = require("../middleware/upload");
const {uploadAndConvertFile}   = require('../controller/upload.controller');

router.post('/uploads', upload.single('file'), uploadAndConvertFile);

module.exports = router;