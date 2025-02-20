class InterviewRepository {
    constructor(InterviewData) {
        this.InterviewData = InterviewData;
    }

    async createInterview(interviewData) {
        return await this.InterviewData.create(interviewData);
    }
}

module.exports = InterviewRepository; 