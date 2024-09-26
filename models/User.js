import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'unique_username', // 인덱스 이름 지정
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'unique_email', // 인덱스 이름 지정
  },
  point: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  loginCooldownEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  accountExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  last_login: {
    type: DataTypes.DATE,  // 마지막 로그인 시간 저장
    allowNull: true,
  }
}, {
  timestamps: true,
});

export default User;
