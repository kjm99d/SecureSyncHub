const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
  expiresAt: {
    type: DataTypes.DATE,
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

module.exports = ProxyUrl;
