const express = require('express');
const router = express.Router();
const { registerUser, loginUser, findPolicy, getUsers } = require('../controllers/userController');

// 회원가입
router.post('/register', registerUser);

// 로그인
router.post('/login', loginUser);

// 정책조회 
router.post('/policies', findPolicy);


// 사용자 목록 조회
router.get('/', getUsers);

module.exports = router;
