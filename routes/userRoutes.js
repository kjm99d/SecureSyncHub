const express = require('express');
const router = express.Router();
const { createUser, getUsers } = require('../controllers/userController');

// 사용자 생성
router.post('/signup', createUser);

// 사용자 목록 조회
router.get('/', getUsers);

module.exports = router;
