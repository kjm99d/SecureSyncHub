import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FilePolicy = sequelize.define('FilePolicy', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  downloadType: {
    type: DataTypes.ENUM('file', 'memory'),
    allowNull: false,
  },
  downloadFilePath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  priority: {
    type: DataTypes.INTEGER,  // 우선순위를 나타내는 필드
    allowNull: false,
    defaultValue: 0,  // 기본값을 설정할 수 있음 (예: 0)
  },
  userId: {
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

export default FilePolicy;
