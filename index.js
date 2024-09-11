const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');

// 미들웨어
app.use(express.json());

// 사용자 관련 라우트 연결
app.use('/api/users', userRoutes);

// 서버 실행
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
