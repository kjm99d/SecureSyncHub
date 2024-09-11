const { Sequelize } = require('sequelize');

// Sequelize 인스턴스 생성 (MySQL에 연결)
const sequelize = new Sequelize(
    'secure_sync_hub',  // < DB NAME
    'codespace_user',   // < DB USERID
    'password',         // < DB USERPW
    {
        host: 'localhost',
        dialect: 'mysql',  // MySQL 사용
        logging: false,
    });

module.exports = sequelize;
