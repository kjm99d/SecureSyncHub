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
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  point: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  lastLoginDeviceId: {
    type: DataTypes.UUID,
    references: {
      model: 'Devices',  // Device 모델의 테이블을 참조
      key: 'id',
    },
    allowNull: true,  // 첫 로그인일 때는 null일 수 있습니다.
  },
  lastLoginAt: {
    type: DataTypes.DATE,  // 마지막 로그인 시간을 저장
    allowNull: true,  // 첫 로그인일 때는 null일 수 있습니다.
  },
  loginCooldownEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
});

export default User;
