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

    async createInterview(title, scoringType, maxScore, file, userId, folderId) {
        try {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // 데이터 처리
            const questions = data[0];  // 첫 번째 행은 질문들
            const timestamps = data[1];  // 두 번째 행은 타임스탬프
            const responses = data.slice(2).map(row => ({
                answers: row
            }));

            const interviewData = {
                folderId: folderId || null,
                userId: userId,
                title: title,  // 클라이언트에서 받은 title 사용
                question: questions,  // 엑셀의 첫 번째 행을 question으로 저장
                response: responses,
                selectedQuestions: [],
                rating: null,
                comments: null,
                ratingType: scoringType || 0,
                maxScore: maxScore || 0
            };

            return await this.interviewRepository.createInterview(interviewData);
        } catch (error) {
            console.error('Error in createInterview:', error);
            throw error;
        }
    }

    async deleteInterview(interviewId, userId) {
        // 인터뷰 존재 여부 및 소유권 확인
        const interview = await this.interviewRepository.findById(interviewId);
        
        if (!interview) {
            throw new GlobalException('인터뷰를 찾을 수 없습니다.', StatusCode.NOT_FOUND);
        }
        
        if (interview.userId !== userId) {
            throw new GlobalException('권한이 없습니다.', StatusCode.FORBIDDEN);
        }

        // 인터뷰 삭제
        return await this.interviewRepository.delete(interviewId);
    }

    async getQuestions(interviewId) {
        const questions = await this.interviewRepository.getQuestions(interviewId);
        if (!questions) {
            throw new GlobalException('질문 목록을 찾을 수 없습니다.', StatusCode.NOT_FOUND);
        }
        return questions;
    }
}

module.exports = InterviewService; 