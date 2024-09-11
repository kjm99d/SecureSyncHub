const { Sequelize } = require('sequelize');

// Sequelize 인스턴스 생성 (MySQL에 연결)
const sequelize = new Sequelize(
    'tutorial',     // < DB NAME
    'vscode',       // < DB USERID
    'notsecure',    // < DB USERPW
    {
        host: 'db',
        dialect: 'mysql',  // MySQL 사용
        logging: false,
    });

module.exports = sequelize;
