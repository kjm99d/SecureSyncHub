const { User } = require('../models');

// 사용자 생성 로직
const createUser = async (username, password, email) => {
  try {
    const newUser = await User.create({ username, password, email });
    return newUser;
  } catch (error) {
    throw new Error('Error creating user');
  }
};

// 사용자 목록 조회 로직
const getUsers = async () => {
  try {
    const users = await User.findAll();
    return users;
  } catch (error) {
    throw new Error('Error fetching users');
  }
};

module.exports = {
  createUser,
  getUsers
};
