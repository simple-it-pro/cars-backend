-- Скрипт настройки БД для Supabase/Railway/Render
-- Скопируйте и выполните в вашей базе данных

-- ==================================================
-- ЧАСТЬ 1: Таблицы для админ-панели
-- ==================================================

-- Таблица ролей администраторов
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица администраторов
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    avatar JSONB,
    role_id UUID REFERENCES admin_roles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    is_super_admin BOOLEAN DEFAULT false,
    last_login_at TIMESTAMPTZ,
    last_login_ip VARCHAR(50),
    password_changed_at TIMESTAMPTZ,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Таблица разрешений
CREATE TABLE IF NOT EXISTS admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    module VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица аудит-логов
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    changes JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    result VARCHAR(20) CHECK (result IN ('SUCCESS', 'FAILED')),
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================================================
-- ЧАСТЬ 2: Индексы для производительности
-- ==================================================

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin ON admin_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_entity ON admin_audit_logs(entity_type, entity_id);

-- ==================================================
-- ЧАСТЬ 3: Начальные данные
-- ==================================================

-- Создать роль Super Admin
INSERT INTO admin_roles (name, slug, description, permissions, is_system_role)
VALUES (
    'Super Admin',
    'super-admin',
    'Полный доступ ко всем функциям системы',
    '["*"]',
    true
)
ON CONFLICT (slug) DO NOTHING;

-- Создать роль Content Moderator
INSERT INTO admin_roles (name, slug, description, permissions, is_system_role)
VALUES (
    'Content Moderator',
    'content-moderator',
    'Модерация контента и отзывов',
    '["posts.view", "posts.moderate", "posts.delete", "reviews.view", "reviews.moderate"]',
    true
)
ON CONFLICT (slug) DO NOTHING;

-- Создать роль User Manager
INSERT INTO admin_roles (name, slug, description, permissions, is_system_role)
VALUES (
    'User Manager',
    'user-manager',
    'Управление пользователями',
    '["users.view", "users.edit", "users.ban", "users.unban"]',
    true
)
ON CONFLICT (slug) DO NOTHING;

-- Создать первого Super Admin пользователя
-- Email: admin@test.com
-- Password: Admin123!
INSERT INTO admin_users (email, password, first_name, last_name, is_super_admin, is_active, role_id)
SELECT
    'admin@test.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Admin',
    'User',
    true,
    true,
    id
FROM admin_roles WHERE slug = 'super-admin'
ON CONFLICT (email) DO NOTHING;

-- Создать тестового Content Moderator
-- Email: moderator@test.com
-- Password: Moderator123!
INSERT INTO admin_users (email, password, first_name, last_name, is_super_admin, is_active, role_id)
SELECT
    'moderator@test.com',
    '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa',
    'Content',
    'Moderator',
    false,
    true,
    id
FROM admin_roles WHERE slug = 'content-moderator'
ON CONFLICT (email) DO NOTHING;

-- ==================================================
-- ЧАСТЬ 4: Базовые разрешения
-- ==================================================

INSERT INTO admin_permissions (name, slug, module, description, category) VALUES
('Просмотр пользователей', 'users.view', 'users', 'Просмотр списка пользователей', 'users'),
('Редактирование пользователей', 'users.edit', 'users', 'Редактирование данных пользователей', 'users'),
('Бан пользователей', 'users.ban', 'users', 'Блокировка пользователей', 'users'),
('Разбан пользователей', 'users.unban', 'users', 'Разблокировка пользователей', 'users'),
('Просмотр постов', 'posts.view', 'posts', 'Просмотр всех постов', 'content'),
('Модерация постов', 'posts.moderate', 'posts', 'Одобрение и отклонение постов', 'content'),
('Удаление постов', 'posts.delete', 'posts', 'Удаление постов', 'content'),
('Просмотр отзывов', 'reviews.view', 'reviews', 'Просмотр всех отзывов', 'content'),
('Модерация отзывов', 'reviews.moderate', 'reviews', 'Верификация отзывов', 'content')
ON CONFLICT (slug) DO NOTHING;

-- ==================================================
-- ГОТОВО!
-- ==================================================

-- Проверка созданных данных
SELECT 'Создано ролей:', COUNT(*) FROM admin_roles;
SELECT 'Создано админов:', COUNT(*) FROM admin_users;
SELECT 'Создано разрешений:', COUNT(*) FROM admin_permissions;

-- Вывод информации о созданных пользователях
SELECT
    email,
    first_name,
    last_name,
    is_super_admin,
    is_active,
    created_at
FROM admin_users
ORDER BY created_at;

-- ==================================================
-- ДАННЫЕ ДЛЯ ВХОДА:
-- ==================================================
--
-- Super Admin:
--   Email: admin@test.com
--   Password: Admin123!
--
-- Content Moderator:
--   Email: moderator@test.com
--   Password: Moderator123!
--
-- ==================================================
