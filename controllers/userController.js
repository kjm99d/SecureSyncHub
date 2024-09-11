const { User } = require('../models');

// 사용자 생성
const createUser = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const newUser = await User.create({ username, password, email });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: 'Error creating user' });
  }
};

// 사용자 목록 조회
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

module.exports = {
  createUser,
  getUsers
};
