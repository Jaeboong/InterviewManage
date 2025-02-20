const directoryService = require('../services/directoryService');
const directoryRepository = require('../repositories/directoryRepository');
const { GlobalException } = require('../global/globalException');
const StatusCode = require('../global/code');

const directoryController = {
    getDirectoryTree: async (req, res) => {
        const userId = req.user.id;  // JWT 미들웨어에서 설정된 user 정보
        const directories = await directoryService.getDirectoryTree(userId);
        
        return res.status(StatusCode.SUCCESS).json({
            success: true,
            message: '디렉토리 조회가 완료되었습니다.',
            data: directories
        });
    },

    getAllItems: async (req, res) => {
        const userId = req.user.id;
        const items = await directoryRepository.getAllItems(userId);
        
        return res.status(StatusCode.SUCCESS).json({
            success: true,
            data: items
        });
    },

    createDirectory: async (req, res) => {
        const userId = req.user.id;
        const { name, parentId } = req.body;
        
        const directory = await directoryRepository.create({
            name,
            userId,
            parentId
        });
        
        return res.status(StatusCode.CREATED).json({
            success: true,
            data: directory
        });
    }
};

module.exports = directoryController; 