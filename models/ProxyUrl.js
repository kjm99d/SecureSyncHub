import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProxyUrl = sequelize.define('ProxyUrl', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {  // 사용자별로 Proxy URL을 관리하기 위한 필드
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id',
    },
    allowNull: false,
  },
  fileId: {
    type: DataTypes.UUID,
    references: {
      model: 'Files',
      key: 'id',
    },
    allowNull: false,
  },
}, {
  timestamps: true,
});

export default ProxyUrl;
