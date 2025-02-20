const directoryRepository = require('../repositories/directoryRepository');
const { GlobalException } = require('../global/globalException');
const StatusCode = require('../global/code');

const directoryService = {
    createRoot: async (userId) => {
        const existingRoot = await directoryRepository.findRootByUserId(userId);
        
        if (existingRoot) {
            throw new GlobalException('이미 루트 디렉토리가 존재합니다.', StatusCode.CONFLICT);
        }

        return await directoryRepository.create({
            name: 'root',
            userId,
            parentId: null
        });
    },

    getDirectoryTree: async (userId) => {
        const directories = await directoryRepository.findByUserId(userId);
        
        if (!directories || directories.length === 0) {
            throw new GlobalException('디렉토리가 존재하지 않습니다.', StatusCode.NOT_FOUND);
        }

        return buildTree(directories);
    }
};

const buildTree = (directories, parentId = null) => {
    const tree = [];
    directories.forEach(dir => {
        if (dir.parentId === parentId) {
            const children = buildTree(directories, dir.id);
            if (children.length > 0) {
                dir.dataValues.children = children;
            }
            tree.push(dir);
        }
    });
    return tree;
};

module.exports = directoryService; 