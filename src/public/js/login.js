document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.querySelector('.login-button');
    
    loginButton.addEventListener('click', async () => {
        const id = document.querySelector('input[placeholder="ID"]').value;
        const password = document.querySelector('input[placeholder="Password"]').value;

        if (!id || !password) {
            alert('아이디와 비밀번호를 모두 입력해주세요.');
            return;
        }

        try {
            const response = await fetch('/interlog/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    password
                })
            });

            const data = await response.json();

            if (data.success) {
                // 토큰을 로컬 스토리지에 저장
                localStorage.setItem('token', data.data.token);
                alert('로그인이 완료되었습니다.');
                window.location.href = '/interlog/interview';
            } else {
                alert(data.message || '로그인에 실패했습니다.');
            }
        } catch (error) {
            alert('로그인 중 오류가 발생했습니다.');
            console.error('Login error:', error);
        }
    });
}); 