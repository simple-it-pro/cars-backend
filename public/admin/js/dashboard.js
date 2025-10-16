const API_BASE = window.location.origin;
let adminToken = localStorage.getItem('adminToken');
let currentPage = {
    users: 1,
    chats: 1,
    messages: 1
};

// Check authentication
if (!adminToken) {
    window.location.href = '/admin/login.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadStatistics();
    setupNavigation();
    setupModalHandlers();
});

function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
}

function switchTab(tabName) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabName);
    });

    // Load data for tab
    switch(tabName) {
        case 'users':
            loadUsers();
            break;
        case 'chats':
            loadChats();
            break;
        case 'messages':
            loadMessages();
            break;
    }
}

async function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('adminUser'));
    if (user) {
        document.getElementById('userName').textContent = user.name || user.phone;
    }
}

async function loadStatistics() {
    try {
        const response = await apiRequest('/admin/statistics');
        document.getElementById('usersCount').textContent = response.users;
        document.getElementById('chatsCount').textContent = response.chats;
        document.getElementById('messagesCount').textContent = response.messages;
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

async function loadUsers(page = 1) {
    try {
        const response = await apiRequest(`/admin/users?page=${page}&limit=10`);
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = '';

        response.data.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.phone}</td>
                <td>${user.name || '-'}</td>
                <td>${user.role}</td>
                <td>${new Date(user.createdAt).toLocaleDateString('ru-RU')}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteUser(${user.id})">Удалить</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        renderPagination('users', page, response.total, 10);
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function loadChats(page = 1) {
    try {
        const response = await apiRequest(`/admin/chats?page=${page}&limit=10`);
        const tbody = document.querySelector('#chatsTable tbody');
        tbody.innerHTML = '';

        response.data.forEach(chat => {
            const participants = chat.users?.map(u => u.name || u.phone).join(' - ') || 'Нет участников';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${chat.id.substring(0, 8)}...</td>
                <td>${participants}</td>
                <td>${chat.lastMessageContent || '-'}</td>
                <td>${new Date(chat.createdAt).toLocaleDateString('ru-RU')}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteChat('${chat.id}')">Удалить</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        renderPagination('chats', page, response.total, 10);
    } catch (error) {
        console.error('Error loading chats:', error);
    }
}

async function loadMessages(page = 1) {
    try {
        const response = await apiRequest(`/admin/messages?page=${page}&limit=10`);
        const tbody = document.querySelector('#messagesTable tbody');
        tbody.innerHTML = '';

        response.data.forEach(msg => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${msg.id.substring(0, 8)}...</td>
                <td>${msg.sender?.name || msg.sender?.phone}</td>
                <td>${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}</td>
                <td>${new Date(msg.createdAt).toLocaleString('ru-RU')}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteMessage('${msg.id}')">Удалить</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        renderPagination('messages', page, response.total, 10);
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

function renderPagination(type, currentPageNum, total, limit) {
    const totalPages = Math.ceil(total / limit);
    const container = document.getElementById(`${type}Pagination`);
    container.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Назад';
    prevBtn.disabled = currentPageNum <= 1;
    prevBtn.onclick = () => {
        currentPage[type] = currentPageNum - 1;
        switch(type) {
            case 'users': loadUsers(currentPage[type]); break;
            case 'chats': loadChats(currentPage[type]); break;
            case 'messages': loadMessages(currentPage[type]); break;
        }
    };
    container.appendChild(prevBtn);

    const pageInfo = document.createElement('span');
    pageInfo.className = 'current-page';
    pageInfo.textContent = `Страница ${currentPageNum} из ${totalPages}`;
    container.appendChild(pageInfo);

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Вперед';
    nextBtn.disabled = currentPageNum >= totalPages;
    nextBtn.onclick = () => {
        currentPage[type] = currentPageNum + 1;
        switch(type) {
            case 'users': loadUsers(currentPage[type]); break;
            case 'chats': loadChats(currentPage[type]); break;
            case 'messages': loadMessages(currentPage[type]); break;
        }
    };
    container.appendChild(nextBtn);
}

// Modal handlers
function setupModalHandlers() {
    document.getElementById('userForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createUser();
    });

    document.getElementById('chatForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createChat();
    });

    document.getElementById('messageForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createMessage();
    });
}

function showCreateUserModal() {
    document.getElementById('userModal').classList.add('active');
    document.getElementById('userModalTitle').textContent = 'Создать пользователя';
    document.getElementById('userForm').reset();
}

function closeUserModal() {
    document.getElementById('userModal').classList.remove('active');
}

async function createUser() {
    const userData = {
        phone: document.getElementById('userPhone').value,
        name: document.getElementById('userName').value || undefined,
        nickname: document.getElementById('userNickname').value || undefined,
        role: document.getElementById('userRole').value,
    };

    try {
        await apiRequest('/admin/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });

        closeUserModal();
        loadUsers(currentPage.users);
        loadStatistics();
        alert('Пользователь создан успешно');
    } catch (error) {
        alert('Ошибка при создании пользователя: ' + error.message);
    }
}

async function deleteUser(id) {
    if (!confirm('Удалить пользователя?')) return;

    try {
        await apiRequest(`/admin/users/${id}`, { method: 'DELETE' });
        loadUsers(currentPage.users);
        loadStatistics();
        alert('Пользователь удален');
    } catch (error) {
        alert('Ошибка при удалении: ' + error.message);
    }
}

async function deleteChat(id) {
    if (!confirm('Удалить чат?')) return;

    try {
        await apiRequest(`/admin/chats/${id}`, { method: 'DELETE' });
        loadChats(currentPage.chats);
        loadStatistics();
        alert('Чат удален');
    } catch (error) {
        alert('Ошибка при удалении: ' + error.message);
    }
}

async function deleteMessage(id) {
    if (!confirm('Удалить сообщение?')) return;

    try {
        await apiRequest(`/admin/messages/${id}`, { method: 'DELETE' });
        loadMessages(currentPage.messages);
        loadStatistics();
        alert('Сообщение удалено');
    } catch (error) {
        alert('Ошибка при удалении: ' + error.message);
    }
}

async function showCreateChatModal() {
    try {
        // Load all users for the dropdowns
        const response = await apiRequest('/admin/users?page=1&limit=1000');
        const users = response.data;

        const userASelect = document.getElementById('chatUserA');
        const userBSelect = document.getElementById('chatUserB');

        // Clear existing options except the first one
        userASelect.innerHTML = '<option value="">Выберите пользователя...</option>';
        userBSelect.innerHTML = '<option value="">Выберите пользователя...</option>';

        // Populate user dropdowns
        users.forEach(user => {
            const optionA = document.createElement('option');
            optionA.value = user.id;
            optionA.textContent = `${user.name || user.phone} (ID: ${user.id})`;
            userASelect.appendChild(optionA);

            const optionB = document.createElement('option');
            optionB.value = user.id;
            optionB.textContent = `${user.name || user.phone} (ID: ${user.id})`;
            userBSelect.appendChild(optionB);
        });

        // Show modal
        document.getElementById('chatModal').classList.add('active');
    } catch (error) {
        alert('Ошибка при загрузке пользователей: ' + error.message);
    }
}

function closeChatModal() {
    document.getElementById('chatModal').classList.remove('active');
    document.getElementById('chatForm').reset();
}

async function createChat() {
    const userAId = parseInt(document.getElementById('chatUserA').value);
    const userBId = parseInt(document.getElementById('chatUserB').value);

    if (!userAId || !userBId) {
        alert('Пожалуйста, выберите обоих участников');
        return;
    }

    if (userAId === userBId) {
        alert('Участники чата должны быть разными пользователями');
        return;
    }

    try {
        await apiRequest('/admin/chats', {
            method: 'POST',
            body: JSON.stringify({ userIds: [userAId, userBId] }),
        });

        closeChatModal();
        loadChats(currentPage.chats);
        loadStatistics();
        alert('Чат создан успешно');
    } catch (error) {
        alert('Ошибка при создании чата: ' + error.message);
    }
}

async function showCreateMessageModal() {
    try {
        // Load all chats
        const chatsResponse = await apiRequest('/admin/chats?page=1&limit=1000');
        const chats = chatsResponse.data;

        const chatSelect = document.getElementById('messageChat');
        chatSelect.innerHTML = '<option value="">Выберите чат...</option>';

        chats.forEach(chat => {
            const option = document.createElement('option');
            option.value = chat.id;
            const participants = chat.users?.map(u => u.name || u.phone).join(' - ') || 'Нет участников';
            option.textContent = `${participants} (${chat.id.substring(0, 8)}...)`;
            chatSelect.appendChild(option);
        });

        // Load all users for sender dropdown
        const usersResponse = await apiRequest('/admin/users?page=1&limit=1000');
        const users = usersResponse.data;

        const senderSelect = document.getElementById('messageSender');
        senderSelect.innerHTML = '<option value="">Выберите отправителя...</option>';

        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.name || user.phone} (ID: ${user.id})`;
            senderSelect.appendChild(option);
        });

        // Show modal
        document.getElementById('messageModal').classList.add('active');
    } catch (error) {
        alert('Ошибка при загрузке данных: ' + error.message);
    }
}

function closeMessageModal() {
    document.getElementById('messageModal').classList.remove('active');
    document.getElementById('messageForm').reset();
}

async function createMessage() {
    const chatId = document.getElementById('messageChat').value;
    const senderId = parseInt(document.getElementById('messageSender').value);
    const content = document.getElementById('messageContent').value.trim();
    const type = document.getElementById('messageType').value;

    if (!chatId || !senderId || !content) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }

    try {
        await apiRequest('/admin/messages', {
            method: 'POST',
            body: JSON.stringify({ chatId, senderId, content, type }),
        });

        closeMessageModal();
        loadMessages(currentPage.messages);
        loadStatistics();
        alert('Сообщение создано успешно');
    } catch (error) {
        alert('Ошибка при создании сообщения: ' + error.message);
    }
}

async function logout() {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            await apiRequest('/auth/logout', {
                method: 'POST',
                body: JSON.stringify({ refreshToken }),
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    }

    localStorage.removeItem('adminToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login.html';
}

async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
        },
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    });

    if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem('adminToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login.html';
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
    }

    return await response.json();
}
