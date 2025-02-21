const express = require('express');
const router = express.Router();
const directoryController = require('../controllers/directoryController');
const authMiddleware = require('../middlewares/auth');

// 디렉토리 생성
router.post('/', authMiddleware, directoryController.createDirectory);

// 디렉토리 목록 조회
router.get('/', authMiddleware, directoryController.getDirectoryTree);

// 단일 디렉토리 조회 추가
router.get('/:id', authMiddleware, directoryController.getDirectory);

// 디렉토리 이름 수정
router.put('/:id', authMiddleware, directoryController.updateDirectory);

// 디렉토리 삭제
router.delete('/:id', authMiddleware, directoryController.deleteDirectory);

module.exports = router;