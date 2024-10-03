// controllers/adminController.js
import Models from '../models/index.js'; // Sequelize 모델에서 File 가져오기
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid'; // UUID 생성용 패키지

const { FilePolicy, User, File, Policy, UserPolicy } = Models;

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
  const { role, loginCooldownHour, point, accountExpiry, lastLoginAt } = req.body;  // 필요한 필드만 추출
  
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: `User with ID ${userId} not found.`
      });
    }

    // 업데이트할 필드만 전달
    await user.update({ role, loginCooldownHour, point, accountExpiry, lastLoginAt });

    res.status(200).json({
      code: 200,
      message: `User ${userId} updated successfully.`,
      user: { role, loginCooldownHour, point, accountExpiry, lastLoginAt }
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
  const { downloadType, downloadFilePath, priority } = req.body;

  try {
    // 사용자와 파일이 있는지 확인
    const user = await User.findByPk(userId);
    const file = await File.findByPk(fileId);

    if (!user || !file) {
      return res.status(404).json({
        code: 404,
        message: 'User or File not found',
      });
    }
    
    // FilePolicy에 사용자와 파일 매핑 및 정책 할당
    const filePolicy = await FilePolicy.create({
      userId: user.id,
      fileId: file.id,
      downloadType,       // 다운로드 방법 (file, memory)
      downloadFilePath,   // 새로운 파일 이름 (선택 사항)
      priority,           // 파일의 우선순위
    });

    // 정책 생성 후, File 정보 포함해서 다시 조회
    const createdFilePolicy = await FilePolicy.findByPk(filePolicy.id, {
      include: {
        model: File,
        attributes: ['id', 'fileName', 'createdAt'], // 필요한 파일 정보만 가져옴
      },
    });

    res.status(201).json({
      code: 201,
      message: `File policy assigned to user '${userId}' for file '${fileId}'.`,
      filePolicy: createdFilePolicy,  // 생성된 정책과 파일 정보를 포함해서 반환
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: 'Error assigning file policy.',
      error: error.message,
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
        message: `File policy with ID '${policyId}' not found.`
      });
    }

    await filePolicy.update(updatedPolicyData);  // 파일 정책 업데이트

    res.status(200).json({
      code: 200,
      message: `File policy '${policyId}' updated successfully.`,
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

const getUserPolicyAndFilePolicy = async (req, res) => {
  try {
    const userId = req.params.userId;

    // 사용자의 파일 정책, 파일 정보와 사용자 정책을 조회
    const user = await User.findByPk(userId, {
      include: [
        {
          model: FilePolicy,
          as: 'filePolicies',
          include: {
            model: File,  // File 정보 포함
            attributes: ['id', 'fileName', 'createdAt'],  // 필요한 파일 정보만 가져옴
          },
        },
        {
          model: UserPolicy,  // 사용자 정책 정보 포함
          as: 'UserPolicies', // 별칭을 관계 정의 시 사용한 별칭으로 수정
          attributes: ['id', 'policyId', 'policyValue'],  // 필요한 사용자 정책 정보만 가져옴
          include: [{  
            model: Policy,
            attributes: ['id', 'policyName']
          }]
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      filePolicies: user.filePolicies,
      userPolicies: user.UserPolicies,  // 사용자 정책 추가
    });
  } catch (error) {
    console.error('Error fetching user policies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteFilePolicy = async (req, res) => {
  const { userId, fileId } = req.params;

  try {
    // 해당 사용자와 파일의 파일 정책을 찾음
    const filePolicy = await FilePolicy.findOne({
      where: { userId, fileId }
    });

    if (!filePolicy) {
      return res.status(404).json({
        code: 404,
        message: 'File policy not found for the specified user and file.',
      });
    }

    // 파일 정책 삭제
    await filePolicy.destroy();

    res.status(200).json({
      code: 200,
      message: `File policy for user '${userId}' and file '${fileId}' has been deleted.`,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: 'Error deleting file policy.',
      error: error.message,
    });
  }
};

const getPolicy = async (req, res) => {
  try {
    // 데이터베이스에서 정책 목록을 조회
    const policies = await Policy.findAll();

    res.status(200).json({
      code: 200,
      message: 'Policies retrieved successfully.',
      policies,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: 'Error retrieving policies.',
      error: error.message,
    });
  }
};

const addPolicy = async (req, res) => {
  const { policyName, description } = req.body;

  try {
    // 정책 이름이 이미 있는지 확인
    const existingPolicy = await Policy.findOne({ where: { policyName } });

    if (existingPolicy) {
      return res.status(400).json({
        code: 400,
        message: 'Policy with this name already exists.',
      });
    }

    // 새로운 정책 추가
    const policy = await Policy.create({
      policyName,
      description,
    });

    res.status(201).json({
      code: 201,
      message: 'Policy added successfully.',
      policy,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: 'Error adding policy.',
      error: error.message,
    });
  }
};

const assignUserPolicy = async (req, res) => {
  try {
    const { userId } = req.params;
    const { policyId, policyValue } = req.body;  // 정책 ID와 정책에 대한 추가 정보

    const newUserPolicy = await UserPolicy.create({
      userId,
      policyId,
      policyValue
    });


    // =========================================================================================== //
    // 사용자의 파일 정책, 파일 정보와 사용자 정책을 조회
    // <!-- 여기는 수정이 필요할 것 같음. 이렇게하면 너무 난잡함 .. 
    const user = await User.findByPk(userId, {
      include: [
        {
          model: UserPolicy,  // 사용자 정책 정보 포함
          //as: 'UserPolicies', // 별칭을 관계 정의 시 사용한 별칭으로 수정
          attributes: ['id', 'policyId', 'policyValue'],  // 필요한 사용자 정책 정보만 가져옴
          include: [{
            model: Policy,
            attributes: ['id', 'policyName']
          }]
        },
      ],
    });
    // =========================================================================================== //
    res.status(201).json({
      message: 'User policy assigned successfully',
      userPolicies: user.UserPolicies
    });
    // =========================================================================================== //
  } catch (error) {
    res.status(500).json({ message: 'Error assigning policy', error });
  }
};

const deleteUserPolicy = async (req, res) => {
  try {
    const { userId, policyId } = req.params;

    const deletedPolicy = await UserPolicy.destroy({
      where: { userId, id: policyId }
    });

    if (deletedPolicy) {
      res.status(200).json({ message: 'User policy deleted successfully' });
    } else {
      res.status(404).json({ message: 'Policy not found for the user' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting policy', error });
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
  deleteFilePolicy,
  updateFilePolicy,
  getUserPolicyAndFilePolicy,
  getPolicy,
  addPolicy,
  assignUserPolicy,
  deleteUserPolicy,
}