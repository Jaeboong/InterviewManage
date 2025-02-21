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
        <img src="/images/${item.type === '폴더' ? 'folder.png' : 'file.png'}" alt="${item.type}">
        <span class="item-name">${item.name}</span>
        <span class="item-date">${formatDate(item.createdAt)}</span>
        <span class="item-type">${item.type}</span>
    `;
    
    // 컨텍스트 메뉴 이벤트 추가
    element.addEventListener('contextmenu', (e) => handleContextMenu(e, item));
    
    element.appendChild(content);
    return element;
};

const renderDirectoryTree = (items, rootId) => {
    const directorySection = document.querySelector('.directory-tree');
    
    if (!directorySection) {
        console.error('필요한 DOM 요소를 찾을 수 없습니다.');
        return;
    }

    directorySection.innerHTML = '';  // 기존 내용 초기화

    // 현재 디렉토리의 정보 찾기
    const currentDirectory = items.find(item => item.id === currentDirectoryId);

    // parentId가 있을 때만 상위 디렉토리 이동 버튼 생성
    if (currentDirectory && currentDirectory.parentId) {
        const upButton = document.createElement('div');
        upButton.className = 'directory-up';
        upButton.innerHTML = `
            <div class="item-details">
                <span class="dots">...</span>
            </div>
        `;

        upButton.addEventListener('click', () => {
            currentDirectoryId = currentDirectory.parentId;
            renderDirectoryTree(items);
            const path = getDirectoryPath(items, currentDirectoryId);
            updateDirectoryPath(path);
        });

        directorySection.appendChild(upButton);
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
    const folders = currentItems.filter(item => item.type === '폴더')
        .sort((a, b) => a.name.localeCompare(b.name));
    const files = currentItems.filter(item => item.type === '문서')
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

// currentDirectoryId를 가져오는 함수
const getCurrentDirectoryId = () => currentDirectoryId;

// 한 번만 export
export { loadDirectories, updateDirectoryPath, getCurrentDirectoryId };

// 컨텍스트 메뉴 요소
const contextMenu = document.querySelector('.context-menu');
let selectedItem = null;

// 컨텍스트 메뉴 이벤트 처리
const handleContextMenu = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    selectedItem = item;  // 여기서 설정됨
    
    console.log('Selected Item:', selectedItem);  // 로그 추가
    console.log('Item Type:', selectedItem.type); // 타입 확인
    
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.style.top = `${e.pageY}px`;
    contextMenu.style.display = 'block';
};

// Modify 버튼 클릭 이벤트
document.querySelector('.menu-item.modify').addEventListener('click', async () => {
    if (!selectedItem) return;

    if (selectedItem.type === '폴더') {
        const folderAddModal = document.getElementById('folderAddModal');
        const folderNameInput = document.getElementById('folderName');
        folderNameInput.value = selectedItem.name;
        folderAddModal.style.display = 'flex';

        // 선택된 아이템의 ID를 사용
        const selectedItemId = selectedItem.id;
        
        const createButton = folderAddModal.querySelector('.create-button');
        const newCreateButtonClone = createButton.cloneNode(true);
        createButton.parentNode.replaceChild(newCreateButtonClone, createButton);

        newCreateButtonClone.addEventListener('click', async () => {
            const newName = folderNameInput.value.trim();
            if (!newName) {
                alert('폴더 이름을 입력해주세요.');
                return;
            }

            const response = await fetch(`/interlog/api/interview/directories/${selectedItemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ name: newName })
            });

            if (!response.ok) {
                const error = await response.json();
                alert(error.message || '폴더 이름 변경에 실패했습니다.');
                return;
            }

            await loadDirectories();
            folderAddModal.style.display = 'none';
        });
    } else if (selectedItem.type === '문서') {
        const fileAddModal = document.getElementById('fileAddModal');
        const titleInput = document.getElementById('interviewTitle');
        titleInput.value = selectedItem.name;
        fileAddModal.style.display = 'flex';
    }
    closeContextMenu();
});

// Delete 버튼 클릭 이벤트
document.querySelector('.menu-item.delete').addEventListener('click', async () => {
    if (!selectedItem) return;

    if (!confirm('정말 삭제하시겠습니까?')) return;

    const endpoint = selectedItem.type === '폴더' 
        ? `/interlog/api/interview/directories/${selectedItem.id}`
        : `/interlog/api/interview/${selectedItem.id}`;
    
    const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        alert(error.message || '삭제에 실패했습니다.');
        return;
    }

    await loadDirectories();
    closeContextMenu();
});

// 컨텍스트 메뉴 닫기
const closeContextMenu = () => {
    contextMenu.style.display = 'none';
    selectedItem = null;
};

// 문서 클릭 시 컨텍스트 메뉴 닫기
document.addEventListener('click', (e) => {
    if (!contextMenu.contains(e.target)) {
        closeContextMenu();
    }
});