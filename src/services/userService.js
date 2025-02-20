const bcrypt = require('bcrypt');
const { GlobalException } = require('../global/globalException');
const StatusCode = require('../global/code');
const userRepository = require('../repositories/userRepository');
const directoryRepository = require('../repositories/directoryRepository');

class UserService {
    async signup(userData) {
        const existingEmail = await userRepository.findByEmail(userData.email);
        const existingId = await userRepository.findById(userData.id);
        
        if (existingEmail) {
            throw new GlobalException('이미 존재하는 이메일입니다.', StatusCode.CONFLICT);
        }

        if (existingId) {
            throw new GlobalException('이미 존재하는 아이디입니다.', StatusCode.CONFLICT);
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const user = await userRepository.save({
            ...userData,
            password: hashedPassword
        });

        await directoryRepository.createRootDirectory(user.id);

        return user;
    }

    async login(id, password) {
        const user = await userRepository.findById(id);
        
        if (!user) {
            throw new GlobalException('존재하지 않는 아이디입니다.', StatusCode.NOT_FOUND);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            throw new GlobalException('비밀번호가 일치하지 않습니다.', StatusCode.UNAUTHORIZED);
        }

        return user;
    }
}

module.exports = new UserService();