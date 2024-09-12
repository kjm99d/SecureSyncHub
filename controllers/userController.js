const { User } = require('../models');

// 회원가입
const registerUser = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const newUser = await User.create({ username, password, email });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: 'Error creating user' });
  }
};

// 로그인
const loginUser = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const newUser = await User.create({ username, password, email });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: 'Error creating user' });
  }
};

// 사용자 정책 조회 API
const findPolicy = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const newUser = await User.create({ username, password, email });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: 'Error creating user' });
  }
};

// 사용자 목록 조회 ( 추후 삭제할 것 )
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  findPolicy,
  getUsers
};
