const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/sequelize/index');
const { globalErrorHandler } = require('./src/global/globalException');
const path = require('path');
const router = require('./src/routes/router');

const app = express();
const port = 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use('/js', express.static(path.join(__dirname, 'src/public/js')));
app.use('/js/constants', express.static(path.join(__dirname, 'src/public/js/constants')));
app.use('/css', express.static(path.join(__dirname, 'src/public/css')));
app.use('/images', express.static(path.join(__dirname, 'src/public/images')));

// 메인 라우터 등록
app.use('/interLog', router);

// 글로벌 에러 핸들러 등록
app.use(globalErrorHandler);

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행중입니다.`);
    
    sequelize.authenticate()
        .then(() => {
            console.log('데이터베이스 연결 성공');
            return sequelize.sync({ force: false });
        })
        .then(() => {
            console.log('데이터베이스 동기화 완료');
        })
        .catch((error) => {
            console.error('데이터베이스 연결 실패:', error);
            process.exit(1);
        });
});

module.exports = app; 