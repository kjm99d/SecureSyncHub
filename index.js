import express from 'express';
import path from 'path'
import { fileURLToPath } from 'url'; // fileURLToPath를 url 모듈에서 가져오기
import userRoutes from './routes/userRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import sequelize from './config/database.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 정적 파일 제공 (CSS, 이미지 등)
app.use(express.static(path.join(__dirname, 'public')));

// 미들웨어
app.use(express.json());

// ========================================================================== //
// API Router Connect
// ========================================================================== //
// 사용자 관련 라우트 연결
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);

// 관리자 관련 라우트 연결
app.use('/api/admin', adminRoutes);  // 관리자 경로
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
