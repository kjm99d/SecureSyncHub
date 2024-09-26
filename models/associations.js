import User from './User.js';
import File from './File.js';
import FilePolicy from './FilePolicy.js';
import ProxyUrl from './ProxyUrl.js';
import Device from './Device.js';
import Log from './Log.js';

// User and FilePolicy
User.hasMany(FilePolicy, { foreignKey: 'userId', onDelete: 'cascade' } );
FilePolicy.belongsTo(User, { foreignKey: 'userId' , onDelete: 'cascade' } );

// File and FilePolicy
File.hasMany(FilePolicy, { foreignKey: 'fileId', onDelete: 'cascade' });
FilePolicy.belongsTo(File, { foreignKey: 'fileId', onDelete: 'cascade' });

// File and ProxyUrl
File.hasOne(ProxyUrl, { foreignKey: 'fileId', onDelete: 'cascade' });
ProxyUrl.belongsTo(File, { foreignKey: 'fileId', onDelete: 'cascade' });

// User and Device
User.hasMany(Device, { foreignKey: 'userId', onDelete: 'cascade' });
Device.belongsTo(User, { foreignKey: 'userId', onDelete: 'cascade' });

// User and Log
User.hasMany(Log, { foreignKey: 'userId', onDelete: 'cascade' });
Log.belongsTo(User, { foreignKey: 'userId', onDelete: 'cascade' });