import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Models from '../models/index.js';
const { User, File, FilePolicy } = Models;

import JwtConfig from '../config/jwt.js'; // 환경 변수 설정
const { JWT_SECRET, JWT_EXPIRATION } = JwtConfig;

// 회원가입
const registerUser = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const newUser = await User.create({ username, password, email });

    // 비밀번호 필드 제거
    const userData = newUser.toJSON();
    delete userData.password;

    res.status(201).json(userData);
  } catch (error) {
    res.status(400).json({ error: 'Error creating user' });
  }
};

// 로그인
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 비밀번호 확인
    //const isPasswordValid = await bcrypt.compare(password, user.password);
    if (password != user.password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role }, // 토큰에 포함할 정보 (payload)
      JWT_SECRET, // 비밀키 (서버에만 존재)
      { expiresIn: JWT_EXPIRATION || '1h' } // 토큰 만료 시간 설정 (기본 1시간)
    );

    // 비밀번호는 제외하고 사용자 정보와 토큰 반환
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(200).json({ user: userWithoutPassword, token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 사용자 정책 조회 API
const findPolicy = async (req, res) => {
  try {
    // 헤더에서 Authorization 토큰 가져오기
    const token = req.headers['authorization'];

    if (!token) {
      return res.status(401).json({ error: 'Token missing' });
    }

    // 토큰 검증
    console.log("1", token);
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // 토큰에서 사용자 ID 추출
    const userId = decoded.id;

    // 사용자 정보와 파일 정책 조회
    const user = await User.findByPk(userId, {
      include: [{
        model: FilePolicy,
        include: [{
          model: File,
          attributes: ['id', 'fileName']
        }]
      }]
    });    

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 사용자와 연결된 정책 반환
    res.status(200).json({
      code: 200,
      message: 'User policy retrieved successfully',
      policies: user.FilePolicies  // 사용자에 할당된 파일 정책들
    });

  } catch (error) {
    res.status(400).json({ error: 'Error retrieving policy' });
  }
};

// 사용자 목록 조회 ( 추후 삭제할 것 )
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

export default {
  registerUser,
  loginUser,
  findPolicy,
  getUsers
};
