const { Sequelize } = require('sequelize');
const config = require('../config/config.js').development;
const User = require('../models/User');
const Directory = require('../models/Directory');
const InterviewData = require('../models/InterviewData');

const db = {};  // db 객체 생성

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    port: config.port,
    pool: config.pool
  }
);

// 모델 초기화
db.User = User(sequelize);
db.Directory = Directory(sequelize);
db.InterviewData = InterviewData(sequelize);

// 관계 설정
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// sequelize 인스턴스와 Sequelize 클래스를 db 객체에 추가
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// 연결 테스트
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('MariaDB 연결 성공');
  } catch (error) {
    console.error('연결 실패:', error);
  }
};

testConnection();

module.exports = db;  // db 객체 export 