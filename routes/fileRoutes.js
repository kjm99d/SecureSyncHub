const express = require('express');
const router = express.Router();
const { downloadFile } = require('../controllers/fileController');

// 파일 다운로드
router.post('/download', downloadFile);

module.exports = router;
