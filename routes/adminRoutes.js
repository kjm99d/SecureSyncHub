// routes/adminRoutes.js
import express from 'express';
const router = express.Router();
import adminController from '../controllers/adminController.js';

const {   getUsers,
    createUser,
    updateUser,
    deleteUser,
    getFiles,
    uploadFile,
    deleteFile } = adminController;

// 사용자 관리
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// 파일 관리
router.get('/files', getFiles);
router.post('/files', uploadFile);
router.delete('/files/:fileId', deleteFile);

export default router;