// routes/adminRoutes.js
import express from 'express';
const router = express.Router();
import adminController from '../controllers/adminController.js';

const {   
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getFiles,
    upload,
    uploadFile,
    deleteFile,
    assignFilePolicy,
    updateFilePolicy
} = adminController;

// 사용자 관리
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// 파일 관리
router.get('/files', getFiles);
router.post('/files', upload.single('file'), uploadFile);
router.delete('/files/:fileId', deleteFile);

// 파일 정책 관리
// 사용자에게 파일 정책 할당
router.post('/users/:userId/files/:fileId/policy', assignFilePolicy);

// 파일 정책 수정
router.put('/policies/:policyId', updateFilePolicy);

export default router;