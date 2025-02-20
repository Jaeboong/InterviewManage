const StatusCode = require('./code');

class GlobalException extends Error {
    constructor(message, statusCode = StatusCode.INTERNAL_SERVER_ERROR) {
        super(message);
        this.statusCode = statusCode;
    }
}

const globalErrorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    if (err instanceof GlobalException) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    // 기본 서버 에러 응답
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '서버 에러가 발생했습니다.'
    });
};

module.exports = {
    GlobalException,
    globalErrorHandler
}; 