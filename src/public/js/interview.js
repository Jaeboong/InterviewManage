import { ScoreTypes } from './constants/scoreTypes.js';
import { loadDirectories, updateDirectoryPath, testLog } from './directory.js';

document.addEventListener('DOMContentLoaded', function() {
    
    const fileAddIcon = document.querySelector('.file-plus-icon');
    const modal = document.getElementById('fileAddModal');
    const radioInputs = document.querySelectorAll('input[name="scoringType"]');
    const maxScoreInput = document.getElementById('maxScore');
    const nextButton = document.querySelector('.next-button');
    const closeButton = document.querySelector('.close-button');

    // 파일 입력 요소 생성 (숨김)
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx, .xls';  // Excel 파일만 허용
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    // 파일 추가 아이콘 클릭 시 모달 표시
    fileAddIcon.addEventListener('click', () => {
        
        modal.style.display = 'block';
    });

    // 라디오 버튼 변경 시 Max Score 입력 필드 활성화/비활성화
    radioInputs.forEach(input => {
        input.addEventListener('change', () => {
            maxScoreInput.disabled = !input.checked;
        });
    });

    // 다음 버튼 클릭 시 파일 업로드 다이얼로그 열기
    nextButton.addEventListener('click', () => {
        console.log('다음 버튼 클릭됨'); // 디버깅 로그

        const title = document.getElementById('interviewTitle').value;
        const scoringType = document.querySelector('input[name="scoringType"]:checked')?.value;
        const maxScore = maxScoreInput.value;

        console.log('입력값:', { title, scoringType, maxScore }); // 디버깅 로그

        // 입력 값 검증
        if (!title || !scoringType || !maxScore) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        // 파일 선택 다이얼로그 열기
        fileInput.click();
        console.log('파일 선택 다이얼로그 열림'); // 디버깅 로그
    });

    // 파일이 선택되었을 때의 처리
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', document.getElementById('interviewTitle').value);
            formData.append('scoringType', getScoreType(document.querySelector('input[name="scoringType"]:checked').value));
            formData.append('maxScore', document.getElementById('maxScore').value);

            // 서버로 데이터 전송 - 경로 수정
            fetch('/interlog/api/interview/upload', {  // 경로 수정
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('파일이 성공적으로 업로드되었습니다.');
                    modal.style.display = 'none';
                } else {
                    alert('파일 업로드에 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('파일 업로드 중 오류가 발생했습니다.');
            });
        }
    });

    // X 버튼 클릭 시 모달 닫기
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // 로그아웃 버튼 이벤트 리스너 추가
    const logoutButton = document.querySelector('.logout-button');
    logoutButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/interlog/api/users/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                alert('로그아웃되었습니다.');
                window.location.href = '/interlog/login';  // 로그인 페이지로 리다이렉트
            } else {
                alert('로그아웃 실패');
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('로그아웃 중 오류가 발생했습니다.');
        }
    });

    // 디렉토리 로드
    loadDirectories();
});

// 사용 예시:
const getScoreType = (selectedRadio) => {
    switch(selectedRadio) {
        case 'selected':
            return ScoreTypes.SELECTED;
        case 'all':
            return ScoreTypes.ALL_QUESTIONS;
        case 'total':
            return ScoreTypes.TOTAL;
        default:
            return ScoreTypes.NONE;
    }
};