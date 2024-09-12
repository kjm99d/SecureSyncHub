// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// 사용자 관리
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// 파일 관리
router.get('/files', adminController.getFiles);
router.post('/files', adminController.uploadFile);
router.delete('/files/:fileId', adminController.deleteFile);

module.exports = router;
