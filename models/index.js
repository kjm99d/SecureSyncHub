const sequelize = require('../config/database');
const User = require('./User');
const File = require('./File');
const FilePolicy = require('./FilePolicy');
const ProxyUrl = require('./ProxyUrl');
const Device = require('./Device');
const Log = require('./Log');

// 관계 설정
require('./associations');

// 데이터베이스 초기화
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synchronized');
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });

module.exports = {
  User,
  File,
  FilePolicy,
  ProxyUrl,
  Device,
  Log,
};
