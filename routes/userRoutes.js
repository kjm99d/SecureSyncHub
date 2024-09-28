import express from 'express';
const router = express.Router();

import userController from '../controllers/userController.js';

const { registerUser, loginUser, findPolicy, getUsers } = userController;

// 회원가입
router.post('/register', registerUser);

// 로그인
router.post('/login', loginUser);

// 정책조회 
router.post('/policies', findPolicy);


// 사용자 목록 조회
router.get('/', getUsers);

export default router;
