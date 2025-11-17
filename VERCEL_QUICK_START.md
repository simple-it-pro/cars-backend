# ⚡ Быстрый деплой на Vercel за 3 минуты

## 🎯 Цель: Получить рабочую админку по ссылке

---

## ⚡ Шаг 1: Создать базу данных (1 минута)

### Используем Vercel Postgres (проще всего):

1. Зайти: https://vercel.com/dashboard
2. Нажать **Storage** → **Create Database** → **Postgres**
3. Назвать: `cars-database`
4. Выбрать регион: **Frankfurt** (ближе к России)
5. Нажать **Create**
6. Скопировать **DATABASE_URL** из раздела `.env.local`

Сохраните этот URL! Он нужен на шаге 3.

---

## ⚡ Шаг 2: Импортировать проект (30 секунд)

1. Зайти: https://vercel.com/new

2. Нажать **Import Git Repository**

3. Если репозиторий уже подключен:
   - Выбрать `simple-it-pro/cars-backend`

   Если нет:
   - Нажать **Add GitHub Account**
   - Разрешить доступ к репозиторию
   - Выбрать `simple-it-pro/cars-backend`

4. **Configure Project:**
   - **Framework Preset**: Other
   - **Root Directory**: `.` (оставить пустым)
   - **Branch**: `claude/analyze-architecture-diagram-01SyTTZzk2snpS7urgBxqds6`

5. Пока НЕ нажимать Deploy!

---

## ⚡ Шаг 3: Добавить переменные (1 минута)

Нажать **Environment Variables** и добавить:

```bash
# База данных (из шага 1)
DB_URL=postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb
DB_SCHEMA=cars

# JWT секреты (можно оставить эти для теста)
JWT_ACCESS_SECRET=test-access-secret-change-in-production-12345678
JWT_REFRESH_SECRET=test-refresh-secret-change-in-production-12345678
JWT_WEBSOCKET_SECRET=test-websocket-secret-change-in-production-12345678
JWT_ACCESS_EXPIRES_IN=60m
JWT_REFRESH_EXPIRES_IN=30d
JWT_WEBSOCKET_EXPIRES_IN=24h

# Админка
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=Admin123!
ADMIN_SESSION_SECRET=my-session-secret-change-me-12345678901234567890
ADMIN_COOKIE_PASSWORD=my-cookie-secret-change-me-12345678901234567890
ADMIN_COOKIE_NAME=adminjs
ADMIN_PANEL_PATH=/admin

# Приложение
PORT=3000
NODE_ENV=production

# SMS (необязательно - для теста)
SMS_TEST_MODE=true
```

**Важно:** Замените `DB_URL` на ваш реальный URL из шага 1!

---

## ⚡ Шаг 4: Деплой! (3 минуты)

1. Нажать **Deploy**
2. Подождать 3-5 минут
3. Вы получите ссылку: `https://your-project.vercel.app`

---

## ⚡ Шаг 5: Настроить БД (1 минута)

После деплоя нужно создать таблицы:

1. Зайти в Vercel Dashboard
2. **Storage** → ваша база `cars-database`
3. Нажать **Query** (вкладка сверху)
4. Вставить этот SQL:

```sql
-- Создать схему
CREATE SCHEMA IF NOT EXISTS cars;

-- Создать таблицы админки
CREATE TABLE IF NOT EXISTS cars.admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cars.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    avatar JSONB,
    role_id UUID REFERENCES cars.admin_roles(id),
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

-- Создать админ роль
INSERT INTO cars.admin_roles (name, slug, description, permissions, is_system_role)
VALUES ('Super Admin', 'super-admin', 'Full system access', '["*"]', true)
ON CONFLICT (slug) DO NOTHING;

-- Создать первого админа (пароль: Admin123!)
INSERT INTO cars.admin_users (email, password, first_name, last_name, is_super_admin, is_active, role_id)
SELECT
    'admin@test.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Admin',
    'User',
    true,
    true,
    id
FROM cars.admin_roles WHERE slug = 'super-admin'
ON CONFLICT (email) DO NOTHING;
```

5. Нажать **Run Query**

---

## ⚡ Шаг 6: Готово! Заходим в админку 🎉

Откройте:
```
https://your-project.vercel.app/admin
```

**Логин:**
- Email: `admin@test.com`
- Пароль: `Admin123!`

---

## 🎨 Что можно делать:

- ✅ Управлять пользователями
- ✅ Модерировать посты
- ✅ Проверять отзывы
- ✅ Смотреть чаты
- ✅ Управлять файлами
- ✅ Отправлять уведомления

---

## 🐛 Не работает?

### Ошибка: 500 Internal Server Error

1. Vercel Dashboard → Deployments → ваш деплой → View Function Logs
2. Смотрите ошибки там

### Не могу войти в /admin

1. Проверьте что SQL скрипт выполнен
2. Убедитесь что пользователь создан:
   ```sql
   SELECT * FROM cars.admin_users;
   ```

### Build failed

1. Проверьте что выбрана правильная ветка
2. Попробуйте Redeploy

---

## 🔄 Автоматические обновления

При каждом push в ветку `claude/analyze-architecture-diagram-01SyTTZzk2snpS7urgBxqds6` Vercel автоматически задеплоит обновления!

---

## 🎯 Готово!

Теперь у вас есть рабочая админка на Vercel:
- ✅ Веб-ссылка для доступа
- ✅ Можно кликать и изменять данные
- ✅ Автоматические обновления
- ✅ Бесплатно (в пределах лимитов)

**Полная инструкция:** См. `VERCEL_DEPLOYMENT.md`
