import { Sequelize } from 'sequelize';

// Sequelize 인스턴스 생성 (MySQL에 연결)
const sequelize = new Sequelize(
    'tutorial',     // < DB NAME
    'vscode',       // < DB USERID
    'notsecure',    // < DB USERPW
    {
        host: 'db',
        dialect: 'mysql',  // MySQL 사용
        logging: false,
    }
);

export default sequelize; // 기본 내보내기
