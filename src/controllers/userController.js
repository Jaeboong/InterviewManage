const userService = require('../services/userService');
const { GlobalException } = require('../global/globalException');
const StatusCode = require('../global/code');
const jwtUtil = require('../utils/jwt');
const db = require('../sequelize');  // DB 접근을 위해 추가

class UserController {
    async signup(req, res, next) {
        const { id, name, email, password, checkPassword } = req.body;

        if (password !== checkPassword) {
            throw new GlobalException('비밀번호가 일치하지 않습니다.', StatusCode.BAD_REQUEST);
        }

        if (!id || !name || !email || !password) {
            throw new GlobalException('필수 정보가 누락되었습니다.', StatusCode.BAD_REQUEST);
        }

        const user = await userService.signup({ id, name, email, password });
        
        return res.status(StatusCode.CREATED).json({
            success: true,
            message: '회원가입이 완료되었습니다.',
            data: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    }

    async login(req, res, next) {
        const { id, password } = req.body;

        if (!id || !password) {
            throw new GlobalException('아이디와 비밀번호를 모두 입력해주세요.', StatusCode.BAD_REQUEST);
        }

        const user = await userService.login(id, password);
        const token = jwtUtil.sign(user);

        // 유저의 root 디렉토리 찾기
        const rootDirectory = await db.Directory.findOne({
            where: {
                userId: user.id,
                name: 'root'
            }
        });

        if (!rootDirectory) {
            throw new GlobalException('root 디렉토리를 찾을 수 없습니다.', StatusCode.NOT_FOUND);
        }
        
        return res.status(StatusCode.SUCCESS).json({
            success: true,
            message: '로그인이 완료되었습니다.',
            data: {
                id: user.id,
                name: user.name,
                token,
                rootDirectoryId: rootDirectory.id  // root 디렉토리 ID 전달
            }
        });
    }

    async logout(req, res, next) {
        return res.status(StatusCode.SUCCESS).json({
            success: true,
            message: '로그아웃되었습니다.'
        });
    }
}

module.exports = new UserController();