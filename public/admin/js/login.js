const API_BASE = window.location.origin;
let currentPhone = '';

// Check if already logged in
if (localStorage.getItem('adminToken')) {
    window.location.href = '/admin/index.html';
}

document.getElementById('phoneForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const phone = document.getElementById('phone').value.trim();
    currentPhone = phone;

    showMessage('', '');

    try {
        const response = await fetch(`${API_BASE}/auth/request-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone }),
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.message || 'Ошибка при отправке кода', 'error');
            return;
        }

        showMessage(data.message || 'Код отправлен', 'success');
        document.getElementById('phoneDisplay').textContent = phone;

        // Switch to code step
        document.getElementById('phoneStep').classList.remove('active');
        document.getElementById('codeStep').classList.add('active');

        // Focus code input
        setTimeout(() => {
            document.getElementById('code').focus();
        }, 100);

    } catch (error) {
        showMessage('Ошибка сети. Проверьте подключение', 'error');
    }
});

document.getElementById('codeForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const code = document.getElementById('code').value.trim();

    showMessage('', '');

    try {
        const response = await fetch(`${API_BASE}/auth/verify-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phone: currentPhone,
                code,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.message || 'Неверный код', 'error');
            return;
        }

        // Check if user is admin
        if (data.user.role !== 'ADMIN') {
            showMessage('У вас нет прав администратора', 'error');
            return;
        }

        // Save tokens
        localStorage.setItem('adminToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('adminUser', JSON.stringify(data.user));

        showMessage('Вход выполнен успешно! Перенаправление...', 'success');

        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = '/admin/index.html';
        }, 1000);

    } catch (error) {
        showMessage('Ошибка сети. Проверьте подключение', 'error');
    }
});

function backToPhone() {
    document.getElementById('codeStep').classList.remove('active');
    document.getElementById('phoneStep').classList.add('active');
    document.getElementById('code').value = '';
    showMessage('', '');
}

function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    if (!text) {
        messageEl.style.display = 'none';
        messageEl.className = 'message';
        return;
    }

    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
}
