const User = require('./User');
const File = require('./File');
const FilePolicy = require('./FilePolicy');
const ProxyUrl = require('./ProxyUrl');
const Device = require('./Device');
const Log = require('./Log');

// User and FilePolicy
User.hasMany(FilePolicy, { foreignKey: 'userId' });
FilePolicy.belongsTo(User, { foreignKey: 'userId' });

// File and FilePolicy
File.hasMany(FilePolicy, { foreignKey: 'fileId' });
FilePolicy.belongsTo(File, { foreignKey: 'fileId' });

// File and ProxyUrl
File.hasOne(ProxyUrl, { foreignKey: 'fileId' });
ProxyUrl.belongsTo(File, { foreignKey: 'fileId' });

// User and Device
User.hasMany(Device, { foreignKey: 'userId' });
Device.belongsTo(User, { foreignKey: 'userId' });

// User and Log
User.hasMany(Log, { foreignKey: 'userId' });
Log.belongsTo(User, { foreignKey: 'userId' });
