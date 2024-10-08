import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Device = sequelize.define('Device', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  fingerprint: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id',
    },
    allowNull: false,
  },
  isAllowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,  // 기본값을 false로 설정
    allowNull: false,
  },
}, {
  timestamps: true,
});

export default Device;