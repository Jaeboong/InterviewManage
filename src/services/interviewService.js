const { GlobalException } = require('../global/globalException');
const StatusCode = require('../global/code');
const XLSX = require('xlsx');

class InterviewService {
    constructor(interviewRepository) {
        this.interviewRepository = interviewRepository;
    }

    // 엑셀 날짜 숫자를 문자열로 변환하는 함수
    excelDateToString(serial) {
        // Excel의 날짜를 JavaScript Date 객체로 변환
        const utc_days = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;
        const date_info = new Date(utc_value * 1000);

        // 한국 시간대로 변환
        const korean_time = new Date(date_info.getTime() + (9 * 60 * 60 * 1000));

        // YYYY. MM. DD 오후/오전 HH:MM:SS 형식으로 포맷팅
        const year = korean_time.getFullYear();
        const month = String(korean_time.getMonth() + 1).padStart(2, '0');
        const day = String(korean_time.getDate()).padStart(2, '0');
        const hours = korean_time.getHours();
        const minutes = String(korean_time.getMinutes()).padStart(2, '0');
        const seconds = String(korean_time.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? '오후' : '오전';
        const hour12 = hours % 12 || 12;

        return `${year}. ${month}. ${day} ${ampm} ${hour12}:${minutes}:${seconds}`;
    }

    async createInterview(title, scoringType, maxScore, file) {
        // 입력값 검증
        if (!title) {
            throw new GlobalException('제목을 입력해주세요.', StatusCode.BAD_REQUEST);
        }

        if (scoringType === undefined || scoringType === null) {
            throw new GlobalException('채점 방식을 선택해주세요.', StatusCode.BAD_REQUEST);
        }

        if (!maxScore || maxScore <= 0) {
            throw new GlobalException('최대 점수를 올바르게 입력해주세요.', StatusCode.BAD_REQUEST);
        }

        if (!file) {
            throw new GlobalException('파일을 업로드해주세요.', StatusCode.BAD_REQUEST);
        }

        // 엑셀 파일 파싱
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // 첫 번째 행에서 질문 추출 (A열 제외)
        const questions = jsonData[0].slice(1);

        // A열에서 타임스탬프 추출 및 변환
        const timestamps = jsonData.slice(1).map(row => this.excelDateToString(row[0]));

        // 응답 데이터 추출 (A열 제외)
        const responses = jsonData.slice(1).map(row => ({
            answers: row.slice(1)
        }));

        // 데이터 생성
        const interviewData = {
            title,
            ratingType: scoringType,
            maxScore,
            question: questions,
            timestamp: timestamps,
            response: responses,
            rating: []  // 초기에는 빈 배열
        };

        return await this.interviewRepository.createInterview(interviewData);
    }
}

module.exports = InterviewService; 