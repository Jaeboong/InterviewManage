// 현재 디렉토리 ID를 저장할 변수
let currentDirectoryId = null;

const loadDirectories = async () => {
    const token = localStorage.getItem('token');

    const response = await fetch('/interlog/api/interview/directories', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new GlobalException('디렉토리 로드 실패', response.status);
    }

    const data = await response.json();
    
    if (!data.success) {
        throw new GlobalException(data.message, StatusCode.BAD_REQUEST);
    }

    // 처음 접속 시 root 디렉토리 ID 설정
    if (!currentDirectoryId) {
        currentDirectoryId = data.data.rootId;
        console.log('root 디렉토리로 설정:', currentDirectoryId);
    }

    renderDirectoryTree(data.data.items);
};

const createDirectoryElement = (item) => {
    const element = document.createElement('div');
    element.className = 'directory-item';
    
    const content = document.createElement('div');
    content.className = 'item-details';
    
    // 날짜 포맷팅 함수
    const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    content.innerHTML = `
        <img src="/images/${item.type === '파일 폴더' ? 'folder.png' : 'file.png'}" alt="${item.type}">
        <span class="item-name">${item.name}</span>
        <span class="item-date">${formatDate(item.createdAt)}</span>
        <span class="item-type">${item.type}</span>
    `;
    
    element.appendChild(content);
    return element;
};

const renderDirectoryTree = (items, rootId) => {
    const directorySection = document.querySelector('.directory-tree');
    const directoryUp = document.querySelector('.directory-up');
    
    if (!directorySection || !directoryUp) {
        console.error('필요한 DOM 요소를 찾을 수 없습니다.');
        return;
    }

    directorySection.innerHTML = '';  // 기존 내용 초기화
    
    // root가 아닐 때만 상위 폴더로 가는 버튼 표시
    if (currentDirectoryId && currentDirectoryId !== rootId) {
        directoryUp.style.display = 'flex';
        directoryUp.style.visibility = 'visible';  // 완전히 보이게 설정
        
        // 상위 폴더로 이동하는 이벤트 리스너
        directoryUp.onclick = () => {
            const currentFolder = items.find(item => item.id === currentDirectoryId);
            if (currentFolder && currentFolder.parentId) {
                currentDirectoryId = currentFolder.parentId;
                renderDirectoryTree(items, rootId);
                updateDirectoryPath(getDirectoryPath(items, currentDirectoryId));
            }
        };
        
        directorySection.appendChild(directoryUp);
    } else {
        directoryUp.style.display = 'none';
        directoryUp.style.visibility = 'hidden';  // 완전히 숨김
    }

    console.log('서버에서 받은 아이템들:', items);
    console.log('현재 디렉토리 ID:', currentDirectoryId);

    if (!items || items.length === 0) {
        const emptyElement = document.createElement('div');
        emptyElement.className = 'empty-directory';
        emptyElement.textContent = 'empty';
        directorySection.appendChild(emptyElement);
        return;
    }

    // 현재 디렉토리의 아이템들만 필터링
    const currentItems = items.filter(item => item.parentId === currentDirectoryId);

    // 폴더와 파일 분리 및 정렬
    const folders = currentItems.filter(item => item.type === '파일 폴더')
        .sort((a, b) => a.name.localeCompare(b.name));
    const files = currentItems.filter(item => item.type === '텍스트 문서')
        .sort((a, b) => a.name.localeCompare(b.name));

    // 폴더 먼저 렌더링
    folders.forEach(folder => {
        const itemElement = createDirectoryElement(folder);
        // 폴더 클릭 이벤트 추가
        itemElement.addEventListener('click', () => {
            currentDirectoryId = folder.id;  // 현재 디렉토리 ID 업데이트
            renderDirectoryTree(items);  // 현재 디렉토리의 내용으로 다시 렌더링
            
            // 경로 업데이트
            const path = getDirectoryPath(items, folder.id);
            updateDirectoryPath(path);
        });
        directorySection.appendChild(itemElement);
    });

    // 파일 렌더링
    files.forEach(file => {
        const itemElement = createDirectoryElement(file);
        directorySection.appendChild(itemElement);
    });
};

// 디렉토리 경로 계산 함수
const getDirectoryPath = (items, currentId) => {
    const path = [];
    let current = currentId;

    while (current) {
        const item = items.find(i => i.id === current);
        if (!item) break;
        path.unshift(item.name);
        current = item.parentId;
    }

    return path.join('/');
};

// 디렉토리 경로 표시 함수
const updateDirectoryPath = (currentPath) => {
    const pathElement = document.querySelector('.directory-path');
    const maxWidth = 300;
    
    let fullPath = '/root' + (currentPath ? '/' + currentPath : '');
    
    if (getTextWidth(fullPath) > maxWidth) {
        const paths = fullPath.split('/');
        if (paths.length > 4) {
            fullPath = `/${paths[1]}/.../${paths[paths.length - 2]}/${paths[paths.length - 1]}`;
        }
    }
    
    pathElement.textContent = fullPath;
};

// 텍스트 너비 계산 함수
const getTextWidth = (text) => {
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
    const context = canvas.getContext('2d');
    context.font = window.getComputedStyle(document.querySelector('.directory-path')).font;
    return context.measureText(text).width;
};

// 현재 경로 계산 함수
const getCurrentPath = (directories) => {
    // 여기서 현재 선택된 디렉토리의 경로를 계산
    // 예: 'folder1/folder2/folder3'
    return directories.reduce((path, dir) => {
        return path ? `${path}/${dir.name}` : dir.name;
    }, '');
};

// 초기 로드 시 경로 업데이트
document.addEventListener('DOMContentLoaded', () => {
    console.log('페이지 로드됨');
    loadDirectories();  // 디렉토리 목록 불러오기
});

// 폴더 생성 함수 수정
const createFolder = async (folderName) => {
    
    const response = await fetch('/interlog/api/interview/directories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            name: folderName,
            parentId: currentDirectoryId
        })
    });

    if (!response.ok) {
        throw new GlobalException('폴더 생성 실패', response.status);
    }

    const data = await response.json();
    console.log('폴더 생성 응답:', data);

    await loadDirectories();  // 폴더 생성 후 목록 다시 로드
};

// 모달 관련 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', () => {
    const folderAddModal = document.getElementById('folderAddModal');
    const folderPlusIcon = document.querySelector('.folder-plus-icon');
    const createButton = folderAddModal.querySelector('.create-button');
    const cancelButton = folderAddModal.querySelector('.cancel-button');
    const folderNameInput = document.getElementById('folderName');

    // 폴더 추가 아이콘 클릭
    folderPlusIcon.addEventListener('click', () => {
        folderAddModal.style.display = 'flex';
        folderNameInput.value = '';
        folderNameInput.focus();
    });

    // Create 버튼 클릭
    createButton.addEventListener('click', async () => {
        const folderName = folderNameInput.value.trim();
        if (folderName) {
            await createFolder(folderName);
            folderAddModal.style.display = 'none';
        }
    });

    // Cancel 버튼 클릭
    cancelButton.addEventListener('click', () => {
        folderAddModal.style.display = 'none';
    });

    // 모달 외부 클릭 시 닫기
    folderAddModal.addEventListener('click', (e) => {
        if (e.target === folderAddModal) {
            folderAddModal.style.display = 'none';
        }
    });
});

// 테스트용 함수
export const testLog = () => {
    console.log('directory.js의 testLog 함수 실행됨!');
};

export { loadDirectories, updateDirectoryPath }; 