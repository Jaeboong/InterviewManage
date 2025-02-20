const { GlobalException } = require('../global/globalException');
const StatusCode = require('../global/code');
const directoryRepository = require('../repositories/directoryRepository');

class InterviewController {
    constructor(interviewService) {
        this.interviewService = interviewService;
    }

    async createInterview(req, res, next) {
        try {
            const { title, scoringType, maxScore } = req.body;
            const file = req.file;  // multer로 파싱된 파일
            
            const interview = await this.interviewService.createInterview(
                title,
                parseInt(scoringType),
                parseInt(maxScore),
                file
            );

            return res.status(StatusCode.CREATED).json({
                success: true,
                data: interview
            });
        } catch (error) {
            next(error);
        }
    }

    async getDirectories(req, res, next) {
        try {
            const userId = req.user.id;  // JWT 미들웨어에서 설정된 user 정보
            const items = await directoryRepository.getAllItems(userId);

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                data: items
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = InterviewController; 