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
    deleteFilePolicy,
    updateFilePolicy,
    getUserPolicyAndFilePolicy,
    getPolicy,
    addPolicy,
    deletePolicy,
    assignUserPolicy,
    deleteUserPolicy,
} = adminController;

// 사용자 관리
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// 사용자의 정책과 파일정책을 조회
router.get('/users/:userId/policies', getUserPolicyAndFilePolicy);

// 파일 관리
router.get('/files', getFiles);
router.post('/files', upload.single('file'), uploadFile);
router.delete('/files/:fileId', deleteFile);

// 파일 정책 관리
// 사용자에게 파일 정책 할당
router.post('/users/:userId/files/:fileId/policy', assignFilePolicy);
router.delete('/users/:userId/files/:fileId/policy', deleteFilePolicy);

// 정책 관리
router.get("/policy", getPolicy);
router.put("/policy", addPolicy);
router.delete('/policy/:id', deletePolicy);

// 사용자 정책관리
router.post('/users/:userId/policy', assignUserPolicy);     // Add User Policy
router.delete('/users/:userId/policy/:policyId', deleteUserPolicy); // Delete User Policy

// 파일 정책 수정
router.put('/policies/:policyId', updateFilePolicy);

export default router;