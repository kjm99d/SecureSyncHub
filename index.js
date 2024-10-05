import express from 'express';
import path from 'path'
import { fileURLToPath } from 'url'; // fileURLToPath를 url 모듈에서 가져오기
import userRoutes from './routes/userRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import sequelize from './config/database.js';
import bodyParser from 'body-parser';

import JwtConf from './config/jwt.js'

import cors from 'cors';

const app = express();

app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 정적 파일 제공 (CSS, 이미지 등)
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ========================================================================== //
// API Router Connect
// ========================================================================== //
// 사용자 관련 라우트 연결
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);


import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JwtConf.JWT_SECRET); // JWT 시크릿으로 토큰 검증
    req.user = decoded; // 토큰에서 사용자 정보를 추출하여 req.user에 저장
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token.' });
  }
};

const adminMiddleware = (req, res, next) => {
  const userRole = req.user?.role;  // JWT에서 추출한 사용자 정보 중 role 확인

  if (userRole === 'admin') {
    return next(); // 관리자라면 다음 미들웨어로 이동
  } else {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};

// 관리자 관련 라우트 연결
app.use('/api/admin',verifyToken, adminMiddleware, adminRoutes);  // 관리자 경로
// ========================================================================== //
// Start Server
// ========================================================================== //
// Database Sync
const syncDatabase = async () => {
  try {
    await sequelize.sync({ 
      alter: true // 변경 발생 시에만 처리
    });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing the database:', error);
  }
};

syncDatabase();

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
