module.exports = {
  development: {
    username: 'manager',
    password: '1234',
    database: 'interview',
    host: 'localhost',
    dialect: 'mariadb',
    port: 3308,  // docker-compose에서 설정한 외부 포트
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
}; 