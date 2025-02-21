const { GlobalException } = require('../global/globalException');
const StatusCode = require('../global/code');
const directoryRepository = require('../repositories/directoryRepository');

class InterviewController {
    constructor(interviewService) {
        this.interviewService = interviewService;
    }

    async createInterview(req, res, next) {
        const { title, scoringType, maxScore, folderId } = req.body;
        const file = req.file;  // multer로 파싱된 파일
        const userId = req.user.id;  // JWT 미들웨어에서 설정된 user 정보
        
        if (!file) {
            throw new GlobalException('파일이 없습니다.', StatusCode.BAD_REQUEST);
        }

        const interview = await this.interviewService.createInterview(
            title,
            parseInt(scoringType),
            parseInt(maxScore),
            file,
            userId,
            folderId
        );

        return res.status(StatusCode.CREATED).json({
            success: true,
            data: interview
        });
    }

    async getDirectories(req, res, next) {
        const userId = req.user.id;  // JWT 미들웨어에서 설정된 user 정보
        const items = await directoryRepository.getAllItems(userId);

        if (!items) {
            throw new GlobalException('디렉토리 조회에 실패했습니다.', StatusCode.NOT_FOUND);
        }

        return res.status(StatusCode.SUCCESS).json({
            success: true,
            data: items
        });
    }

    async deleteInterview(req, res, next) {
        const interviewId = req.params.id;
        const userId = req.user.id;

        const result = await this.interviewService.deleteInterview(interviewId, userId);
        
        if (!result) {
            throw new GlobalException('인터뷰 삭제에 실패했습니다.', StatusCode.NOT_FOUND);
        }

        return res.status(StatusCode.SUCCESS).json({
            success: true,
            message: '인터뷰가 삭제되었습니다.'
        });
    }

    async getQuestions(req, res, next) {
        const interviewId = req.params.id;
        const questions = await this.interviewService.getQuestions(interviewId);

        return res.status(StatusCode.SUCCESS).json({
            success: true,
            questions: questions
        });
    }
}

module.exports = InterviewController; 