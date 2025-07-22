const express = require('express');
const { getFileByCode } = require('../controller/getfile.controller');
const router = express.Router();

router.get('/file/:code', getFileByCode);

module.exports = router;
