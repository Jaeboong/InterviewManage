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
    },

    updateDirectory: async (req, res) => {
        const userId = req.user.id;
        const directoryId = req.params.id;
        const { name } = req.body;

        // 디렉토리 존재 여부 및 소유권 확인
        const directory = await directoryRepository.findById(directoryId);
        if (!directory) {
            throw new GlobalException('디렉토리를 찾을 수 없습니다.', StatusCode.NOT_FOUND);
        }
        if (directory.userId !== userId) {
            throw new GlobalException('권한이 없습니다.', StatusCode.FORBIDDEN);
        }

        const updatedDirectory = await directoryRepository.update(directoryId, { name });
        
        return res.status(StatusCode.SUCCESS).json({
            success: true,
            message: '디렉토리 이름이 변경되었습니다.',
            data: updatedDirectory
        });
    },

    deleteDirectory: async (req, res) => {
        const userId = req.user.id;
        const directoryId = req.params.id;

        // 디렉토리 존재 여부 및 소유권 확인
        const directory = await directoryRepository.findById(directoryId);
        if (!directory) {
            throw new GlobalException('디렉토리를 찾을 수 없습니다.', StatusCode.NOT_FOUND);
        }
        if (directory.userId !== userId) {
            throw new GlobalException('권한이 없습니다.', StatusCode.FORBIDDEN);
        }

        await directoryRepository.delete(directoryId);
        
        return res.status(StatusCode.SUCCESS).json({
            success: true,
            message: '디렉토리가 삭제되었습니다.'
        });
    },

    getDirectory: async (req, res) => {
        const userId = req.user.id;
        const directoryId = req.params.id;

        const directory = await directoryRepository.findById(directoryId);
        
        if (!directory) {
            throw new GlobalException('디렉토리를 찾을 수 없습니다.', StatusCode.NOT_FOUND);
        }

        if (directory.userId !== userId) {
            throw new GlobalException('권한이 없습니다.', StatusCode.FORBIDDEN);
        }

        return res.status(StatusCode.SUCCESS).json({
            success: true,
            directory: {
                id: directory.id,
                name: directory.name,
                parentId: directory.parentId
            }
        });
    }
};

module.exports = directoryController; 