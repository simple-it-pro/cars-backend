// API Configuration
const API_URL = 'https://cars-backend-kv4l.vercel.app';

// Navigation
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;

        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Show section
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(section).classList.add('active');

        // Load data for section
        loadSectionData(section);
    });
});

// Load section data
function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'users':
            loadUsers();
            break;
        case 'posts':
            loadPosts();
            break;
        case 'reviews':
            loadReviews();
            break;
        case 'chats':
            loadChats();
            break;
    }
}

// Check API Status
async function checkAPIStatus() {
    try {
        const response = await fetch(`${API_URL}/health`);
        if (response.ok) {
            document.getElementById('api-status').className = 'badge bg-success';
            document.getElementById('api-status').textContent = 'Онлайн ✓';
            return true;
        }
    } catch (error) {
        document.getElementById('api-status').className = 'badge bg-danger';
        document.getElementById('api-status').textContent = 'Оффлайн ✗';
        return false;
    }
}

// Load Dashboard Stats
async function loadDashboard() {
    checkAPIStatus();

    // Note: These endpoints require auth, so we show placeholders
    document.getElementById('stat-users').textContent = 'N/A';
    document.getElementById('stat-posts').textContent = 'N/A';
    document.getElementById('stat-reviews').textContent = 'N/A';
    document.getElementById('stat-chats').textContent = 'N/A';

    // Try to get health check
    try {
        const health = await fetch(`${API_URL}/health`);
        if (health.ok) {
            const data = await health.json();
            console.log('Health check:', data);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load Users
async function loadUsers() {
    const container = document.getElementById('users-table-container');
    container.innerHTML = `
        <div class="alert alert-info">
            <i class="bi bi-info-circle"></i>
            <strong>Требуется авторизация</strong><br>
            Для просмотра пользователей необходимо авторизоваться через API.<br>
            <a href="${API_URL}/api#/auth/AuthController_login" target="_blank" class="btn btn-sm btn-primary mt-2">
                <i class="bi bi-box-arrow-in-right"></i> Авторизоваться в Swagger
            </a>
        </div>
        <div class="card">
            <div class="card-header">Как работать с пользователями</div>
            <div class="card-body">
                <h6>1. Регистрация нового пользователя:</h6>
                <p>Откройте <a href="${API_URL}/api#/auth/AuthController_register" target="_blank">POST /auth/register</a> в Swagger UI</p>

                <h6 class="mt-3">2. Вход:</h6>
                <p>Откройте <a href="${API_URL}/api#/auth/AuthController_login" target="_blank">POST /auth/login</a> в Swagger UI</p>

                <h6 class="mt-3">3. Получить список пользователей:</h6>
                <p>После авторизации используйте <a href="${API_URL}/api#/users/UsersController_find" target="_blank">GET /users</a></p>
            </div>
        </div>
    `;
}

// Load Posts
async function loadPosts() {
    const container = document.getElementById('posts-table-container');
    container.innerHTML = `
        <div class="alert alert-info">
            <i class="bi bi-info-circle"></i>
            <strong>Требуется авторизация</strong><br>
            Для просмотра постов необходимо авторизоваться через API.<br>
            <a href="${API_URL}/api#/posts" target="_blank" class="btn btn-sm btn-primary mt-2">
                <i class="bi bi-box-arrow-in-right"></i> Открыть Posts в Swagger
            </a>
        </div>
        <div class="card">
            <div class="card-header">Операции с постами</div>
            <div class="card-body">
                <ul class="list-group">
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Создать пост
                        <a href="${API_URL}/api#/posts/PostsController_create" target="_blank" class="btn btn-sm btn-success">
                            POST /posts
                        </a>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Получить все посты
                        <a href="${API_URL}/api#/posts/PostsController_findAll" target="_blank" class="btn btn-sm btn-primary">
                            GET /posts
                        </a>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Получить пост по ID
                        <a href="${API_URL}/api#/posts/PostsController_findOne" target="_blank" class="btn btn-sm btn-info">
                            GET /posts/:id
                        </a>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Обновить пост
                        <a href="${API_URL}/api#/posts/PostsController_update" target="_blank" class="btn btn-sm btn-warning">
                            PUT /posts/:id
                        </a>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Удалить пост
                        <a href="${API_URL}/api#/posts/PostsController_remove" target="_blank" class="btn btn-sm btn-danger">
                            DELETE /posts/:id
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    `;
}

// Load Reviews
async function loadReviews() {
    const container = document.getElementById('reviews-table-container');
    container.innerHTML = `
        <div class="alert alert-info">
            <i class="bi bi-info-circle"></i>
            <strong>Требуется авторизация</strong><br>
            Для работы с отзывами необходимо авторизоваться через API.<br>
            <a href="${API_URL}/api#/reviews" target="_blank" class="btn btn-sm btn-primary mt-2">
                <i class="bi bi-box-arrow-in-right"></i> Открыть Reviews в Swagger
            </a>
        </div>
        <div class="card">
            <div class="card-header">Операции с отзывами</div>
            <div class="card-body">
                <ul class="list-group">
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Создать отзыв
                        <a href="${API_URL}/api#/reviews/ReviewsController_create" target="_blank" class="btn btn-sm btn-success">
                            POST /reviews
                        </a>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Получить все отзывы
                        <a href="${API_URL}/api#/reviews/ReviewsController_find" target="_blank" class="btn btn-sm btn-primary">
                            GET /reviews
                        </a>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Получить отзыв по ID
                        <a href="${API_URL}/api#/reviews/ReviewsController_findOne" target="_blank" class="btn btn-sm btn-info">
                            GET /reviews/:id
                        </a>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Обновить отзыв
                        <a href="${API_URL}/api#/reviews/ReviewsController_update" target="_blank" class="btn btn-sm btn-warning">
                            PATCH /reviews/:id
                        </a>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Удалить отзыв
                        <a href="${API_URL}/api#/reviews/ReviewsController_remove" target="_blank" class="btn btn-sm btn-danger">
                            DELETE /reviews/:id
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    `;
}

// Load Chats
async function loadChats() {
    const container = document.getElementById('chats-table-container');
    container.innerHTML = `
        <div class="alert alert-info">
            <i class="bi bi-info-circle"></i>
            <strong>Требуется авторизация</strong><br>
            Для работы с чатами необходимо авторизоваться через API.<br>
            <a href="${API_URL}/api#/chats" target="_blank" class="btn btn-sm btn-primary mt-2">
                <i class="bi bi-box-arrow-in-right"></i> Открыть Chats в Swagger
            </a>
        </div>
    `;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});
