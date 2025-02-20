const db = require('../sequelize');
const { Op } = require('sequelize');

const directoryRepository = {
    create: async (directoryData) => {
        // 같은 이름의 폴더가 있는지 확인
        const existingFolders = await db.Directory.findAll({
            where: {
                userId: directoryData.userId,
                parentId: directoryData.parentId,
                name: {
                    [Op.like]: `${directoryData.name}%`  // name으로 시작하는 모든 폴더
                }
            },
            raw: true
        });

        if (existingFolders.length > 0) {
            // 기존 폴더 이름들을 분석하여 다음 번호 결정
            const baseNamePattern = new RegExp(`^${directoryData.name}(?:\\((\\d+)\\))?$`);
            let maxNumber = 1;

            existingFolders.forEach(folder => {
                const match = folder.name.match(baseNamePattern);
                if (match && match[1]) {
                    maxNumber = Math.max(maxNumber, parseInt(match[1]));
                }
            });

            // 같은 이름이 있으면 번호 추가
            if (existingFolders.some(f => f.name === directoryData.name)) {
                directoryData.name = `${directoryData.name}(${maxNumber + 1})`;
            }
        }

        return await db.Directory.create(directoryData);
    },

    findByUserId: async (userId) => {
        return await db.Directory.findAll({
            where: { userId },
            include: [{
                model: db.Directory,
                as: 'children'
            }]
        });
    },

    findRootByUserId: async (userId) => {
        return await db.Directory.findOne({
            where: { 
                userId,
                parentId: null
            }
        });
    },

    createRootDirectory: async (userId) => {
        return await db.Directory.create({
            name: 'root',
            path: '/',
            userId: userId,
            parentId: null
        });
    },

    getAllItems: async (userId) => {
        // 먼저 root 디렉토리 찾기
        const rootDirectory = await db.Directory.findOne({
            where: { 
                userId,
                name: 'root'
            },
            attributes: ['id'],
            raw: true
        });

        // 일반 디렉토리 조회 (root 제외)
        const directories = await db.Directory.findAll({
            where: { 
                userId,
                name: { [db.Sequelize.Op.ne]: 'root' }
            },
            attributes: ['id', 'name', 'parentId', 'createdAt'],
            raw: true
        });

        // 인터뷰 데이터 조회
        const interviews = await db.InterviewData.findAll({
            where: { userId },
            attributes: ['id', 'title', 'createdAt', 'folderId'],
            raw: true
        });

        return {
            rootId: rootDirectory.id,  // root 디렉토리 ID 전달
            items: [
                ...directories.map(dir => ({
                    ...dir,
                    type: '파일 폴더'
                })),
                ...interviews.map(interview => ({
                    id: interview.id,
                    name: interview.title,
                    parentId: interview.folderId,
                    createdAt: interview.createdAt,
                    type: '텍스트 문서'
                }))
            ]
        };
    }
};

module.exports = directoryRepository; 