const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const authMiddleware = require('../middlewares/auth');  // 이름 수정
const directoryController = require('../controllers/directoryController');
const InterviewController = require('../controllers/interviewController');
const InterviewService = require('../services/interviewService');
const InterviewRepository = require('../repositories/interviewRepository');
const db = require('../sequelize');  // sequelize/index.js에서 db 객체 불러오기

// 의존성 주입
const interviewRepository = new InterviewRepository(db.InterviewData);
const interviewService = new InterviewService(interviewRepository);
const interviewController = new InterviewController(interviewService);

// 라우트 설정
router.post('/upload', authMiddleware, upload.single('file'), (req, res, next) => 
    interviewController.createInterview(req, res, next)
);

// directories 라우트를 directoryController.getAllItems로 연결
router.get('/directories', authMiddleware, (req, res, next) => 
    directoryController.getAllItems(req, res, next)
);

router.post('/directories', authMiddleware, (req, res, next) => 
    directoryController.createDirectory(req, res, next)
);

// 디렉토리 수정/삭제 라우트
router.put('/directories/:id', authMiddleware, (req, res, next) =>
    directoryController.updateDirectory(req, res, next)
);

router.delete('/directories/:id', authMiddleware, (req, res, next) =>
    directoryController.deleteDirectory(req, res, next)
);

// 인터뷰 삭제 라우트 추가
router.delete('/:id', authMiddleware, (req, res, next) =>
    interviewController.deleteInterview(req, res, next)
);

router.get('/:id/questions', authMiddleware, (req, res, next) =>
    interviewController.getQuestions(req, res, next)
);

module.exports = router; 