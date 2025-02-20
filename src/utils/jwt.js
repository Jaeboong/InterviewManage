const jwt = require('jsonwebtoken');
const { GlobalException } = require('../global/globalException');
const StatusCode = require('../global/code');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';  // 실제로는 환경변수로 관리

const jwtUtil = {
    // 토큰 생성
    sign: (user) => {
        const payload = {
            id: user.id,
            name: user.name
        };
        
        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: '100h'  // 토큰 유효기간 100시간
        });
    },

    // 토큰 검증
    verify: (token) => {
        if (!token) {
            throw new GlobalException('토큰이 없습니다.', StatusCode.UNAUTHORIZED);
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded) {
            throw new GlobalException('유효하지 않은 토큰입니다.', StatusCode.UNAUTHORIZED);
        }

        return decoded;
    }
};

module.exports = jwtUtil; 