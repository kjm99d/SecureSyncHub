const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const fileRoutes = require('./routes/fileRoutes');
const adminRoutes = require('./routes/adminRoutes');

// 미들웨어
app.use(express.json());

// 사용자 관련 라우트 연결
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);

// 관리자 관련 라우트 연결
app.use('/api/admin', adminRoutes);  // 관리자 경로

// 서버 실행
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
