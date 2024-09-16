// controllers/adminController.js
import Models from '../models/index.js'; // Sequelize 모델에서 File 가져오기
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // UUID 생성용 패키지

const { FilePolicy, User, File } = Models;

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll(); // DB에서 모든 사용자 조회

    res.status(200).json({
      code: 200,
      message: 'User list retrieved successfully.',
      users  // 조회한 사용자 목록 반환
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: 'Error retrieving user list.',
      error: error.message
    });
  }
};

// 새 사용자 추가 ( 과연 필요할까? 회원가입에서 취급이 되는 것 같던데. )
const createUser = (req, res) => {
  const newUser = req.body;
  // 실제로는 DB에 새 사용자를 저장하는 로직을 작성해야 함
  res.status(201).json({
    code: 201,
    message: 'New user created successfully.',
    user: newUser
  });
};

// 사용자 정보 수정
const updateUser = async (req, res) => {
  const userId = req.params.id;
  const updatedUserData = req.body;
  
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: `User with ID ${userId} not found.`
      });
    }

    await user.update(updatedUserData);  // DB에서 사용자 정보 업데이트

    res.status(200).json({
      code: 200,
      message: `User ${userId} updated successfully.`,
      user: updatedUserData
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: 'Error updating user information.',
      error: error.message
    });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: `User with ID ${userId} not found.`
      });
    }

    await user.destroy();  // DB에서 사용자 삭제

    res.status(200).json({
      code: 200,
      message: `User ${userId} deleted successfully.`
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: 'Error deleting user.',
      error: error.message
    });
  }
};

// 파일 목록 조회
const getFiles = async (req, res) => {
  try {
    const files = await File.findAll();  // DB에서 파일 목록 조회
    res.status(200).json({
      code: 200,
      message: 'File list retrieved successfully.',
      files  // 조회한 파일 목록을 반환
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: 'Error retrieving file list.',
      error: error.message
    });
  }
};

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';  // 저장할 폴더 경로

    // 폴더가 없으면 생성
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });  // 하위 폴더까지 생성 가능
    }

    cb(null, uploadDir);  // 파일이 저장될 폴더로 설정
  },
  filename: (req, file, cb) => {
    const tempFilePath = `${uuidv4()}${path.extname(file.originalname)}`; // 임시 파일 경로(UUID + 확장자)
    cb(null, tempFilePath);
  }
});

const upload = multer({ storage });

// 파일 업로드 처리
const uploadFile = async (req, res) => {
  try {
    const fileData = req.file;  // Multer가 처리한 파일 데이터
    const { originalname, mimetype, size, filename } = fileData; // 원본 파일명, 파일 형식, 사이즈, 저장된 파일명(경로)

    const newFile = await File.create({
      id: uuidv4(),
      fileName: originalname, // 원본 파일명 저장
      fileType: mimetype,
      fileSize: size,
      uploadedAt: new Date(),
      filePath: `uploads/${filename}` // 실제 파일 경로(UUID로 생성된 임시 경로)
    });

    res.status(201).json({
      code: 201,
      message: 'File uploaded successfully.',
      file: newFile
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: 'Error uploading file.',
      error: error.message
    });
  }
};

const deleteFile = async (req, res) => {
  const { fileId } = req.params;
  try {
    const file = await File.findByPk(fileId);
    if (!file) {
      return res.status(404).json({
        code: 404,
        message: `File with ID ${fileId} not found.`
      });
    }

    // 파일 경로 가져오기
    const filePath = path.resolve(file.filePath);

    // 파일이 존재하는지 확인하고 삭제
    fs.unlink(filePath, async (err) => {
      if (err) {
        return res.status(500).json({
          code: 500,
          message: 'Error deleting the file from file system.',
          error: err.message
        });
      }

      // DB에서 파일 정보 삭제
      await file.destroy();

      res.status(200).json({
        code: 200,
        message: `File ${fileId} deleted successfully.`
      });
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: 'Error deleting file.',
      error: error.message
    });
  }
};


const assignFilePolicy = async (req, res) => {
  const { userId, fileId } = req.params;
  const { policyType, accessExpiry } = req.body;  // 정책에 대한 정보

  try {
    // 사용자와 파일이 존재하는지 확인
    const user = await User.findByPk(userId);
    const file = await File.findByPk(fileId);

    if (!user || !file) {
      return res.status(404).json({
        code: 404,
        message: `User or File not found.`
      });
    }

    // 새로운 파일 정책 생성
    const filePolicy = await FilePolicy.create({
      userId: user.id,
      fileId: file.id,
      policyType: policyType,   // 정책 유형 (예: 읽기, 쓰기, 다운로드 제한 등)
      accessExpiry: accessExpiry // 정책 만료일
    });

    res.status(201).json({
      code: 201,
      message: `File policy assigned successfully to user ${userId}.`,
      filePolicy
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: 'Error assigning file policy.',
      error: error.message
    });
  }
};

const updateFilePolicy = async (req, res) => {
  const { policyId } = req.params;
  const updatedPolicyData = req.body;

  try {
    const filePolicy = await FilePolicy.findByPk(policyId);
    if (!filePolicy) {
      return res.status(404).json({
        code: 404,
        message: `File policy with ID ${policyId} not found.`
      });
    }

    await filePolicy.update(updatedPolicyData);  // 파일 정책 업데이트

    res.status(200).json({
      code: 200,
      message: `File policy ${policyId} updated successfully.`,
      filePolicy
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: 'Error updating file policy.',
      error: error.message
    });
  }
};

export default {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getFiles,
  upload,
  uploadFile,
  deleteFile,
  assignFilePolicy,
  updateFilePolicy
}