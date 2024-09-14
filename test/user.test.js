// test/user.test.js
import request from 'supertest';
import { expect } from 'chai';

import app from '../index.js'; // Express 앱 파일 경로
import sequelize from '../config/database.js'; // Sequelize 설정 파일 경로

import User from '../models/User.js'; // User 모델 파일 경로


describe('POST /api/v1/users/register', () => {

  before(async () => {
    await sequelize.sync();
    await User.destroy({ where : {} });
  });


  // CASE 1
  it('should create a new user and return a 201 status', async () => {
    const newUser = {
      username: 'testuser',
      password: 'TestPassword123!',
      email: 'testuser@example.com',
    };

    const res = await request(app)
      .post('/api/v1/users/register') // 경로 수정
      .send(newUser); // API 요청 보내기

    // 응답 상태 및 데이터 확인
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('username', newUser.username);
    expect(res.body).to.have.property('email', newUser.email);
    //expect(res.body).to.not.have.property('password'); // 비밀번호는 응답에 포함되지 않음
  });

  // CASE 2
  it('should return a 401 status if the user data is invalid', async () => {
    const invalidUser = {
      username: 'testuser',
      password: 'short', // 유효하지 않은 비밀번호
      email: 'testuser@example.com',
    };

    const res = await request(app)
      .post('/api/v1/users/login') // 경로 수정
      .send(invalidUser);

    // 응답 상태 및 오류 메시지 확인
    expect(res.status).to.equal(401);
    //expect(res.body).to.have.property('message').that.includes('Validation error');
  });
});
