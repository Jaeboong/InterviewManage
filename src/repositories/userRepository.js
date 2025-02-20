const db = require('../sequelize');

class UserRepository {
    async findById(id) {
        return await db.User.findOne({ where: { id } });
    }

    async findByEmail(email) {
        return await db.User.findOne({ where: { email } });
    }

    async save(userData) {
        return await db.User.create(userData);
    }
}

module.exports = new UserRepository();