import bcrypt from 'bcrypt';
import Models from '../models/index.js';
const { User } = Models;

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

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // 비밀번호는 제외하고 사용자 정보와 토큰 반환
    // const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(200).json({ user: userWithoutPassword, token });

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

export default {
  registerUser,
  loginUser,
  findPolicy,
  getUsers
};
