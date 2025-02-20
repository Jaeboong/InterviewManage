const StatusCode = {
    // 성공 코드
    SUCCESS: 200,
    CREATED: 201,

    // 클라이언트 에러
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,

    // 서버 에러
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

module.exports = StatusCode; 