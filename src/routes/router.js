const express = require('express');
const router = express.Router();
const path = require('path');
const userRoutes = require('./userRoutes');
const interviewRoutes = require('./interviewRoutes');

// 페이지 라우팅
router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'view', 'signup.html'));
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'view', 'login.html'));
});

router.get('/interview', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'view', 'interview.html'));
});

// API 라우터
router.use('/api/users', userRoutes);
router.use('/api/interview', interviewRoutes);  // 여기서 interview 관련 모든 라우팅 처리

// 기본 경로 처리
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: '서버가 정상적으로 실행중입니다.'
    });
});

module.exports = router; 