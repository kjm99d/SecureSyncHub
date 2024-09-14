import express from 'express';
const router = express.Router();
import downloadFile from '../controllers/fileController.js';

// 파일 다운로드
router.post('/download', downloadFile);

export default router;
