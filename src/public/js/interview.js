import { ScoreTypes } from './constants/scoreTypes.js';
import { loadDirectories, updateDirectoryPath, getCurrentDirectoryId } from './directory.js';

// 파일 수정 모드를 위한 변수들
let isFileModifyMode = false;
let selectedFileId = null;

// 파일 수정 모드 설정 함수를 최상위 레벨로 이동
export const setFileModifyMode = (fileId) => {
    isFileModifyMode = true;
    selectedFileId = fileId;
};

document.addEventListener('DOMContentLoaded', function() {
    
    const fileAddIcon = document.querySelector('.file-plus-icon');
    const fileAddModal = document.getElementById('fileAddModal');
    const questionSelectModal = document.getElementById('questionSelectModal');
    const radioInputs = document.querySelectorAll('input[name="scoringType"]');
    const maxScoreInput = document.getElementById('maxScore');
    const nextButton = document.querySelector('.next-button');
    const closeButton = document.querySelector('.close-button');
    const logoutButton = document.querySelector('.logout-button');
    const questionsContainer = document.querySelector('.questions-container');
    const pageNumbers = document.querySelector('.page-numbers');
    
    let currentQuestions = [];
    let currentPage = 1;
    const questionsPerPage = 4;
    let selectedQuestionIndices = [];

    // 우클릭 메뉴에서 modify 선택 시 상태 저장
    let isModifyMode = false;
    let selectedItemId = null;

    // 파일 입력 요소 생성
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx, .xls';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    // 파일 추가 아이콘 클릭 시 모달 표시
    if (fileAddIcon) {
        fileAddIcon.addEventListener('click', () => {
            fileAddModal.style.display = 'block';
        });
    }

    // X 버튼 클릭 시 모달 닫기
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            fileAddModal.style.display = 'none';
            maxScoreInput.value = '';
            radioInputs.forEach(input => input.checked = false);
            questionSelectModal.style.display = 'none';
        });
    }

    // 라디오 버튼 변경 시 Max Score 입력 필드 활성화/비활성화
    if (radioInputs) {
        radioInputs.forEach(input => {
            input.addEventListener('change', () => {
                maxScoreInput.disabled = !input.checked;
                if (input.value === 'selected') {
                    questionSelectModal.style.display = 'flex';
                } else {
                    questionSelectModal.style.display = 'none';
                }
            });
        });
    }

    // 폴더 추가 모달의 버튼들
    const createButton = document.querySelector('.create-button');
    const cancelButton = document.querySelector('.cancel-button');
    const folderAddModal = document.getElementById('folderAddModal');

    // modify 모드일 때 버튼 텍스트 변경
    function updateModalButtons(isModify) {
        if (isModify) {
            createButton.textContent = 'Update';
            cancelButton.textContent = 'Cancel';
        } else {
            createButton.textContent = 'Create';
            cancelButton.textContent = 'Cancel';
        }
    }

    // Update/Create 버튼 클릭 이벤트
    createButton.addEventListener('click', async () => {
        const folderName = document.getElementById('folderName').value;
        if (!folderName) {
            alert('폴더 이름을 입력해주세요.');
            return;
        }

        try {
            const url = isModifyMode 
                ? `/interlog/api/interview/directories/${selectedItemId}`
                : '/interlog/api/interview/directories';
            
            const method = isModifyMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ name: folderName })
            });

            const data = await response.json();
            if (data.success) {
                alert(isModifyMode ? '폴더가 성공적으로 수정되었습니다.' : '폴더가 성공적으로 생성되었습니다.');
                folderAddModal.style.display = 'none';
                document.getElementById('folderName').value = '';
                // modify 모드 초기화
                isModifyMode = false;
                selectedItemId = null;
                updateModalButtons(false);
                // 디렉토리 목록 새로고침
                loadDirectories();
            } else {
                alert(isModifyMode ? '폴더 수정에 실패했습니다.' : '폴더 생성에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(isModifyMode ? '폴더 수정 중 오류가 발생했습니다.' : '폴더 생성 중 오류가 발생했습니다.');
        }
    });

    // Cancel 버튼 클릭 이벤트
    cancelButton.addEventListener('click', () => {
        folderAddModal.style.display = 'none';
        document.getElementById('folderName').value = '';
        // modify 모드 초기화
        isModifyMode = false;
        selectedItemId = null;
        updateModalButtons(false);
    });

    // 다음 버튼 클릭 이벤트
    if (nextButton) {
        nextButton.addEventListener('click', async () => {
            const title = document.getElementById('interviewTitle').value;
            if (!title) {
                throw new GlobalException('제목을 입력해주세요.', StatusCode.BAD_REQUEST);
            }

            if (isFileModifyMode) {
                const response = await fetch(`/interlog/api/interview/${selectedFileId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        title: title,
                        scoringType: document.querySelector('input[name="scoringType"]:checked')?.value || 'none',
                        maxScore: document.getElementById('maxScore').value || '0'
                    })
                });

                if (!response.ok) {
                    throw new GlobalException('파일 수정에 실패했습니다.', response.status);
                }

                const data = await response.json();
                if (!data.success) {
                    throw new GlobalException(data.message, StatusCode.BAD_REQUEST);
                }

                alert('파일이 성공적으로 수정되었습니다.');
                fileAddModal.style.display = 'none';
                // 상태 초기화
                isFileModifyMode = false;
                selectedFileId = null;
                // 입력값 초기화
                document.getElementById('interviewTitle').value = '';
                document.getElementById('maxScore').value = '';
                radioInputs.forEach(input => input.checked = false);
                // 디렉토리 새로고침
                loadDirectories();
            } else {
                // 기존 파일 업로드 로직
                fileInput.click();
            }
        });
    }

    // 파일 선택 시 처리
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            const title = document.getElementById('interviewTitle').value;
            if (!title) {
                alert('제목을 입력해주세요.');
                return;
            }
            formData.append('title', title);
            formData.append('file', file);
            
            const scoringType = document.querySelector('input[name="scoringType"]:checked');
            const maxScore = document.getElementById('maxScore').value;
            
            if (scoringType && scoringType.value === 'selected' && !maxScore) {
                alert('Selected Score 유형을 선택하셨습니다. 최대 점수를 입력해주세요.');
                return;
            }

            if (scoringType) {
                formData.append('scoringType', scoringType.value);
                formData.append('maxScore', maxScore || '0');
            } else {
                formData.append('scoringType', 'none');
                formData.append('maxScore', '0');
            }

            formData.append('folderId', getCurrentDirectoryId());

            try {
                // 진짜 진짜 맞는 API 주소
                const response = await fetch('/interlog/api/interview/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                const data = await response.json();
                if (data.success) {
                    alert('파일이 성공적으로 업로드되었습니다.');
                    fileAddModal.style.display = 'none';
                    document.getElementById('interviewTitle').value = '';
                    document.getElementById('maxScore').value = '';
                    radioInputs.forEach(input => input.checked = false);
                } else {
                    alert('파일 업로드에 실패했습니다.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('파일 업로드 중 오류가 발생했습니다.');
            }
        }
    });

    // 로그아웃 버튼 클릭 시 처리
    if (logoutButton) {
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
                    localStorage.removeItem('token');
                    alert('로그아웃되었습니다.');
                    window.location.href = '/interlog/login';
                } else {
                    alert('로그아웃 실패');
                }
            } catch (error) {
                console.error('Logout error:', error);
                alert('로그아웃 중 오류가 발생했습니다.');
            }
        });
    }

    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (e) => {
        if (e.target === fileAddModal) {
            fileAddModal.style.display = 'none';
        }
        if (e.target === questionSelectModal) {
            questionSelectModal.style.display = 'none';
        }
    });

    // 질문 표시 함수
    function displayQuestions(page) {
        currentPage = page;
        questionsContainer.innerHTML = '';
        
        const start = (page - 1) * questionsPerPage;
        const end = Math.min(start + questionsPerPage, currentQuestions.length);
        
        for (let i = start; i < end; i++) {
            const questionItem = document.createElement('div');
            questionItem.className = 'question-item';
            questionItem.innerHTML = `
                <span class="question-number">${i + 1}</span>
                <div class="vertical-line"></div>
                <span class="question-text">${currentQuestions[i]}</span>
                <div class="select-checkbox ${selectedQuestionIndices.includes(i) ? 'selected' : ''}" 
                     data-index="${i}"></div>
            `;
            
            const checkbox = questionItem.querySelector('.select-checkbox');
            if (selectedQuestionIndices.includes(i)) {
                checkbox.style.background = '#71D3BA';
            }
            
            checkbox.addEventListener('click', () => {
                const index = parseInt(checkbox.dataset.index);
                const isSelected = selectedQuestionIndices.includes(index);
                
                if (isSelected) {
                    selectedQuestionIndices = selectedQuestionIndices.filter(i => i !== index);
                    checkbox.style.background = '#EEF1F8';
                } else {
                    selectedQuestionIndices.push(index);
                    checkbox.style.background = '#71D3BA';
                }
            });
            
            questionsContainer.appendChild(questionItem);
        }
    }

    // 페이지네이션 업데이트
    function updatePagination() {
        const totalPages = Math.ceil(currentQuestions.length / questionsPerPage);
        pageNumbers.innerHTML = '';
        
        for (let i = 1; i <= totalPages; i++) {
            const pageNumber = document.createElement('span');
            pageNumber.className = `page-number ${i === currentPage ? 'active' : ''}`;
            pageNumber.textContent = i;
            pageNumber.addEventListener('click', () => {
                displayQuestions(i);
                updatePagination();
            });
            pageNumbers.appendChild(pageNumber);
        }
    }


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