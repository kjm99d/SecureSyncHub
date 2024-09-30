import User from './User.js';
import File from './File.js';
import FilePolicy from './FilePolicy.js';
import ProxyUrl from './ProxyUrl.js';
import Device from './Device.js';
import Log from './Log.js';
import Policy from './Policy.js';
import UserPolicy from './UserPolicy.js';

// 관계 설정 (ES Modules 방식으로 변환)
import './associations.js';

export default {
  User,
  File,
  FilePolicy,
  ProxyUrl,
  Device,
  Log,
  Policy,
  UserPolicy,
};
