import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FilePolicy = sequelize.define('FilePolicy', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  downloadMethod: {
    type: DataTypes.ENUM('direct', 'proxy'),
    allowNull: false,
  },
  newFilename: {
    type: DataTypes.STRING,
    allowNull: true,
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
