const jwtUtil = require('../utils/jwt');
const { GlobalException } = require('../global/globalException');
const StatusCode = require('../global/code');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
        throw new GlobalException('인증이 필요합니다.', StatusCode.UNAUTHORIZED);
    }

    const decoded = jwtUtil.verify(token);
    req.user = decoded;
    next();
};

module.exports = authMiddleware; 