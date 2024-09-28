import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid'; // UUID 생성용 패키지
import bcrypt from 'bcrypt';
import Models from '../models/index.js';
const { User, File, FilePolicy, ProxyUrl } = Models;

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

const findPolicy = async (req, res) => {
  try {
    // 헤더에서 Authorization 토큰 가져오기
    const token = req.headers['authorization'];

    if (!token) {
      return res.status(401).json({ error: 'Token missing' });
    }

    // 토큰 검증
    const decoded = jwt.verify(token, JWT_SECRET); // JWT_SECRET은 환경변수로 설정
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // 토큰에서 사용자 ID 추출
    const userId = decoded.id;

    // 사용자 정보와 파일 정책 조회
    const user = await User.findByPk(userId, {
      include: [{
        model: FilePolicy,
        attributes: ['id', 'downloadFilePath', "priority"],
        ///*
        // 파일 정보는 제외하고 보내는게 맞는 것 같음.
        // File Key 노출시키는 행위 자체가 좋은게 아니라고 생각된다.
        include: [{  // File 모델을 추가로 포함
          model: File,
          attributes: ['id']
        }]
        //*/
      }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 파일 정책에 대한 Proxy URL 생성
    const policiesWithProxyUrl = await Promise.all(user.FilePolicies.map(async (policy) => {
      // File이 존재하는지 확인 (정책에 File이 연결되어 있지 않은 경우 대비)
      if (!policy.File) {
        return {
          ...policy.toJSON(),
          proxyUrl: null, // File이 없을 경우 Proxy URL을 생성하지 않음
        };
      }

      const fileId = policy.File.id;

      // Proxy URL 생성
      const url = `${uuidv4()}`;

      // Proxy URL 저장 (userId도 함께 저장)
      const proxyUrl = await ProxyUrl.create({
        url,
        userId: user.id,  // user의 id를 저장
        fileId
      });

      // Proxy URL을 정책과 함께 반환
      return {
        ...policy.toJSON(), // 기존 정책 정보
        proxyUrl: proxyUrl.url  // Proxy URL 추가
      };
    }));

    // 사용자와 연결된 정책 반환
    res.status(200).json({
      code: 200,
      message: 'User policy retrieved successfully',
      policies: policiesWithProxyUrl  // Proxy URL이 추가된 정책 반환
    });

  } catch (error) {
    console.error(error);
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
