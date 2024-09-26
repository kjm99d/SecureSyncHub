import express from 'express';
import userRoutes from './routes/userRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import sequelize from './config/database.js';

const app = express();

const STR_API_VERSION = '/api/v1';

// EJS 템플릿 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // views 디렉토리 경로 설정

// 정적 파일 제공 (CSS, 이미지 등)
app.use(express.static(path.join(__dirname, 'public')));

// 미들웨어
app.use(express.json());

// ========================================================================== //
// API Router Connect
// ========================================================================== //
// 사용자 관련 라우트 연결
app.use(`${STR_API_VERSION}/users`, userRoutes);
app.use(`${STR_API_VERSION}/files`, fileRoutes);

// 관리자 관련 라우트 연결
app.use(`${STR_API_VERSION}/admin`, adminRoutes);


// 데이터베이스 초기화
await sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synchronized');
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });


// 데이터베이스 연결 및 서버 실행 (테스트 시에는 서버 실행 부분 생략)
if (process.env.NODE_ENV !== 'test') {  // 테스트 환경이 아닌 경우에만 서버 시작
  const PORT = 3000;
  
  sequelize.sync().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }).catch(err => {
    console.error('Unable to connect to the database:', err);
  });
}

// mocha 테스트 코드 동작 시 필요
export default app;