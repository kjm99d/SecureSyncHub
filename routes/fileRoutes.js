import express from 'express';
const router = express.Router();
import fileController from '../controllers/fileController.js';

const { downloadFile } = fileController;

// 파일 다운로드
router.post('/download', downloadFile);

export default router;
