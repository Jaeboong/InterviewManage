class InterviewRepository {
    constructor(InterviewData) {
        this.InterviewData = InterviewData;
    }

    async createInterview(interviewData) {
        return await this.InterviewData.create(interviewData);
    }

    async findById(id) {
        return await this.InterviewData.findByPk(id);
    }

    async delete(id) {
        return await this.InterviewData.destroy({
            where: { id }
        });
    }

    async update(id, data) {
        return await this.InterviewData.update(data, {
            where: { id }
        });
    }

    async getQuestions(id) {
        const interview = await this.InterviewData.findByPk(id);
        return interview ? interview.question : null;
    }
}

module.exports = InterviewRepository; 