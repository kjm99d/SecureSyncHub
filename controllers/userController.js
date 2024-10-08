import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid'; // UUID 생성용 패키지
import bcrypt from 'bcrypt';
import Models from '../models/index.js';
const { User, File, FilePolicy, ProxyUrl, Device, UserPolicy, Policy } = Models;

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
    const { username, password, fingerprint } = req.body; // fingerprint를 요청 본문에서 받음

    // 기본 로그인 로직 ( ID + PW 검증 )
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 비밀번호 확인
    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // ======================================================================================== //
    // 계정 만료일 체크 (만료일이 오늘 이전이면 로그인 차단)
    // ======================================================================================== //
    const currentDate = new Date();
    const accountExpiryDate = new Date(user.accountExpiry);

    if (currentDate > accountExpiryDate) {
      return res.status(403).json({ error: 'Your account has expired.' });
    }

    // ======================================================================================== //
    // 1. loginCooldownHour가 0이면 쿨다운 및 디바이스 확인 없이 바로 로그인
    // ======================================================================================== //
    if (user.loginCooldownHour === 0) {
      // 바로 JWT 토큰 생성
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION || '1h' }
      );

      // 마지막 로그인 시간 업데이트
      user.lastLoginAt = new Date();
      await user.save();

      const { password: _, ...userWithoutPassword } = user.toJSON();
      return res.status(200).json({ user: userWithoutPassword, token });
    }

    // ======================================================================================== //
    // 2. 쿨다운 시간이 0이 아닌 경우에만 디바이스 정보 확인
    // ======================================================================================== //
    let device = await Device.findOne({ where: { fingerprint, userId: user.id } });
    if (!device) {
      device = await Device.create({ fingerprint, userId: user.id });
    }

    // ======================================================================================== //
    // 3. 허용된 장치인지 확인
    // ======================================================================================== //
    if (!device.isAllowed) {
      return res.status(403).json({ error: 'This device is not allowed for login.' });
    }

    // ======================================================================================== //
    // 4. 마지막 로그인 장치와 다른 장치인지 확인
    // ======================================================================================== //
    if (!user.lastLoginDeviceId || user.lastLoginDeviceId !== device.id) {
      // 마지막 로그인 장치가 없으면 현재 로그인 장치로 업데이트
      if (!user.lastLoginDeviceId) {
        user.lastLoginDeviceId = device.id;
      } else {
        const cooldownHours = user.loginCooldownHour; // 사용자별 쿨다운 시간
        const now = new Date();
        const lastLoginAt = new Date(user.lastLoginAt);
        const diffInHours = Math.abs(now - lastLoginAt) / 36e5; // 시간 단위로 차이 계산

        if (diffInHours < cooldownHours) {
          return res.status(429).json({
            error: `Please wait ${cooldownHours - diffInHours.toFixed(1)} more hours to login from this device.`,
          });
        }
      }
    }

    // ======================================================================================== //
    // JWT 토큰 생성
    // ======================================================================================== //
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION || '1h' }
    );

    // ======================================================================================== //
    // 마지막 로그인 장치 및 시간 업데이트
    // ======================================================================================== //
    user.lastLoginDeviceId = device.id;
    user.lastLoginAt = new Date();
    await user.save();

    // 비밀번호는 제외하고 사용자 정보와 토큰 반환
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(200).json({ user: userWithoutPassword, token });

  } catch (error) {
    // ======================================================================================== //
    // 오류 처리
    // ======================================================================================== //
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

    // 사용자 정보와 파일 정책 및 사용자 정책 조회
    const user = await User.findByPk(userId, {
      include: [
        {
          model: FilePolicy,
          attributes: ['id', 'downloadType', 'downloadFilePath', 'priority'],
          include: [{  
            model: File,
            attributes: ['id', 'fileName']
          }]
        },
        {
          model: UserPolicy,
          attributes: ['policyId'],
          include: [{  
            model: Policy,
            attributes: ['policyName']
          }]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // ============================================================================================ //
    // 파일 정책에 대한 Proxy URL 생성
    // ============================================================================================ //
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
    // ============================================================================================ //
    // 사용자 정책과 파일 정책을 함께 반환
    // ============================================================================================ //
    res.status(200).json({
      code: 200,
      message: 'User and file policies retrieved successfully',
      userPolicy: user.UserPolicies, // 사용자 정책 추가
      filePolicy: policiesWithProxyUrl  // Proxy URL이 추가된 파일 정책 반환
    });

  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error retrieving policies' });
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
