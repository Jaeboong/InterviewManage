document.addEventListener('DOMContentLoaded', () => {
    const signupButton = document.querySelector('.signup-button');
    
    signupButton.addEventListener('click', async () => {
        const id = document.querySelector('input[placeholder="ID"]').value;
        const name = document.querySelector('input[placeholder="Name"]').value;
        const email = document.querySelector('input[placeholder="Email"]').value;
        const password = document.querySelector('input[placeholder="Password"]').value;
        const checkPassword = document.querySelector('input[placeholder="Check Password"]').value;

        try {
            const response = await fetch('/interlog/api/users/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    name,
                    email,
                    password,
                    checkPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('회원가입이 완료되었습니다.');
                window.location.href = '/interlog/login';
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('회원가입 중 오류가 발생했습니다.');
        }
    });
});