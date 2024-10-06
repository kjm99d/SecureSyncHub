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
      model: 'Devices',
      key: 'id',
    },
    allowNull: true,
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    defaultValue: new Date('2024-01-01'),  // 기본값을 2024-01-01로 설정
    allowNull: false,
  },
  loginCooldownHour: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  accountExpiry: {
    type: DataTypes.DATE,
    defaultValue: new Date('2024-01-01'),  // 기본값을 2024-01-01로 설정
    allowNull: false,  // NULL 허용하지 않음
  },
}, {
  timestamps: true,
});

export default User;
