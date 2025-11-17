# 🚀 Деплой Cars Backend Admin на Vercel

## Быстрый старт за 5 минут

Эта инструкция поможет вам задеплоить админку на Vercel и получить рабочую веб-ссылку для управления бэкендом.

---

## Шаг 1: Подготовка базы данных (2 минуты)

Vercel не хостит базу данных, поэтому нужно использовать внешний сервис.

### Вариант A: Vercel Postgres (Рекомендуется) ⭐

1. Зайдите на https://vercel.com/dashboard
2. Создайте новый проект Storage → Postgres
3. Скопируйте **DATABASE_URL**

### Вариант B: Supabase (Бесплатно)

1. Зайдите на https://supabase.com
2. Создайте новый проект
3. Перейдите в Settings → Database
4. Скопируйте **Connection string** (режим Session)

### Вариант C: Railway (Бесплатно)

1. Зайдите на https://railway.app
2. New Project → Provision PostgreSQL
3. Скопируйте **DATABASE_URL** из Variables

---

## Шаг 2: Форк или импорт репозитория (30 секунд)

### Вариант A: Через GitHub

1. Зайдите в ваш GitHub репозиторий
2. Переключитесь на ветку: `claude/analyze-architecture-diagram-01SyTTZzk2snpS7urgBxqds6`
3. Нажмите Fork (или используйте существующий репо)

### Вариант B: Прямой импорт

Можно импортировать напрямую в Vercel на шаге 3.

---

## Шаг 3: Импорт в Vercel (1 минута)

1. Зайдите на https://vercel.com/new

2. Выберите **Import Git Repository**

3. Выберите ваш репозиторий: `simple-it-pro/cars-backend`

4. В **Branch** выберите: `claude/analyze-architecture-diagram-01SyTTZzk2snpS7urgBxqds6`

5. **Framework Preset**: Выберите "Other"

6. **Root Directory**: Оставьте пустым (`.`)

7. **Build Command**:
   ```bash
   yarn install && yarn build
   ```

8. **Output Directory**: `dist`

9. **Install Command**:
   ```bash
   yarn install
   ```

---

## Шаг 4: Настройка переменных окружения (2 минуты)

Нажмите **Environment Variables** и добавьте:

### Обязательные переменные:

```bash
# Database (из шага 1)
DB_URL=postgres://username:password@host:5432/database
DB_SCHEMA=cars

# JWT Secrets
JWT_ACCESS_SECRET=your-super-secret-access-key-change-me
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-me
JWT_WEBSOCKET_SECRET=your-super-secret-websocket-key-change-me
JWT_ACCESS_EXPIRES_IN=60m
JWT_REFRESH_EXPIRES_IN=30d
JWT_WEBSOCKET_EXPIRES_IN=24h

# Admin Panel
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123Change!
ADMIN_SESSION_SECRET=your-very-long-session-secret-minimum-32-chars
ADMIN_COOKIE_NAME=adminjs
ADMIN_COOKIE_PASSWORD=your-very-long-cookie-secret-minimum-32-chars
ADMIN_PANEL_PATH=/admin

# Port
PORT=3000

# SMS (опционально)
SMS_RU_API_ID=your-sms-api-key
SMS_TEST_MODE=true

# S3 (опционально - для файлов)
S3_ACCESS_KEY=your-s3-access-key
S3_SECRET_KEY=your-s3-secret-key
S3_BUCKET_NAME=cars-bucket
S3_API_ENDPOINT=https://s3.amazonaws.com
S3_REGION=us-east-1
```

### Генерация безопасных секретов:

Используйте онлайн генератор или команду:

```bash
# Локально на вашем компьютере
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Запустите 3 раза для трёх JWT секретов и 2 раза для Admin секретов.

---

## Шаг 5: Деплой! (3-5 минут)

1. Нажмите **Deploy**

2. Vercel начнёт сборку проекта

3. Дождитесь завершения (обычно 3-5 минут)

4. Вы получите URL: `https://your-project.vercel.app`

---

## Шаг 6: Настройка базы данных (1 минута)

После деплоя нужно создать таблицы в базе данных.

### Вариант A: Через Vercel Postgres Dashboard

1. Зайдите в ваш Postgres на Vercel
2. Откройте Query Editor
3. Скопируйте и выполните SQL из `scripts/setup-admin-db.sql`

### Вариант B: Через psql (локально)

```bash
# Подключитесь к вашей базе
psql "your-database-url-from-vercel"

# Создайте схему
CREATE SCHEMA IF NOT EXISTS cars;

# Запустите SQL скрипт
\i scripts/setup-admin-db.sql
```

### Вариант C: Через TypeORM миграции

Если вы настроили TypeORM миграции:

```bash
# Установите переменные окружения локально
export DB_URL="your-database-url"

# Запустите миграции
yarn migration:run
```

---

## Шаг 7: Доступ к админке! 🎉

Откройте браузер:

```
https://your-project.vercel.app/admin
```

**Логин:**
- Email: `admin@example.com` (или что вы указали в ADMIN_EMAIL)
- Password: `Admin123Change!` (или что вы указали в ADMIN_PASSWORD)

---

## 🎨 Что вы можете делать в админке:

✅ **Управление пользователями**
- Просмотр всех пользователей
- Поиск и фильтрация
- Редактирование профилей
- Бан/разбан пользователей
- Изменение ролей

✅ **Модерация контента**
- Просмотр постов
- Публикация/снятие с публикации
- Удаление контента
- Управление хештегами

✅ **Управление отзывами**
- Проверка отзывов
- Верификация
- Удаление спама

✅ **Мониторинг чатов**
- Просмотр сообщений
- Модерация

✅ **Файлы**
- Управление файлами
- Статистика хранилища

✅ **Уведомления**
- Массовая рассылка
- Системные объявления

---

## 🔧 Настройка после деплоя

### 1. Изменить пароль администратора

```sql
-- Подключитесь к базе и выполните:
UPDATE admin_users
SET password = '$2a$10$NEW_BCRYPT_HASH_HERE'
WHERE email = 'admin@example.com';
```

Чтобы сгенерировать новый хеш пароля:

```bash
# Локально
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YourNewPassword123!', 10))"
```

### 2. Настроить домен (опционально)

1. Зайдите в Vercel Dashboard
2. Settings → Domains
3. Добавьте свой домен: `admin.yourdomain.com`
4. Настройте DNS записи по инструкции Vercel

### 3. Включить логи

В Vercel Dashboard:
- Deployments → ваш деплой → View Function Logs
- Можно видеть все ошибки и запросы

---

## 🐛 Troubleshooting (Решение проблем)

### Проблема: 500 Internal Server Error

**Решение:**
1. Проверьте логи в Vercel Dashboard
2. Убедитесь что все environment variables добавлены
3. Проверьте DATABASE_URL - должен быть доступен из интернета

### Проблема: Не могу войти в админку

**Решение:**
1. Проверьте что ADMIN_EMAIL и ADMIN_PASSWORD правильные
2. Убедитесь что таблица `admin_users` создана в БД
3. Проверьте что пользователь существует:
   ```sql
   SELECT email, is_active FROM admin_users;
   ```

### Проблема: База данных не подключается

**Решение:**
1. Проверьте DB_URL - должен быть в формате:
   ```
   postgres://user:password@host:5432/dbname
   ```
2. Убедитесь что БД доступна из интернета (не localhost!)
3. Проверьте что схема существует:
   ```sql
   CREATE SCHEMA IF NOT EXISTS cars;
   ```

### Проблема: Build failed

**Решение:**
1. Проверьте что используете правильную ветку
2. Убедитесь что `package.json` содержит все зависимости
3. Проверьте Build Command: `yarn install && yarn build`

### Проблема: Страница /admin показывает 404

**Решение:**
1. Убедитесь что в `src/app.module.ts` импортирован `AdminModule`
2. Проверьте что установлены все AdminJS зависимости
3. Пересоберите проект: Vercel Dashboard → Deployments → Redeploy

### Проблема: Очень медленно загружается

**Решение:**
1. Vercel serverless функции холодные - первый запрос может быть медленным
2. Увеличьте memory в `vercel.json` (уже 3008 MB)
3. Рассмотрите платный план Vercel Pro для лучшей производительности

---

## 🚀 Продвинутые настройки

### Custom domain для админки

```bash
# В Vercel Dashboard:
Settings → Domains → Add Domain
# Добавьте: admin.yourdomain.com
```

### Webhook для auto-deploy

При каждом push в ветку `claude/analyze-architecture-diagram-01SyTTZzk2snpS7urgBxqds6` Vercel автоматически задеплоит новую версию.

### Защита IP-адресами (опционально)

В `src/admin/admin.options.ts`:

```typescript
auth: {
    authenticate: async (email: string, password: string, { req }) => {
        // Только эти IP могут заходить
        const allowedIPs = ['1.2.3.4', '5.6.7.8'];
        const clientIP = req.headers['x-forwarded-for'] || req.ip;

        if (!allowedIPs.includes(clientIP)) {
            return null;
        }

        // ... остальная логика
    },
}
```

### HTTPS-only

Vercel автоматически предоставляет HTTPS для всех доменов!

---

## 📊 Мониторинг

### Просмотр логов в реальном времени:

1. Vercel Dashboard
2. Ваш проект → Functions
3. Выберите функцию `dist/src/main.js`
4. Нажмите View Logs

### Метрики использования:

1. Vercel Dashboard → Analytics
2. Смотрите:
   - Количество запросов
   - Время отклика
   - Ошибки
   - География пользователей

---

## 💰 Стоимость

### Бесплатный план Vercel:

- ✅ 100 GB bandwidth / месяц
- ✅ 6000 минут serverless execution
- ✅ Автоматический HTTPS
- ✅ Неограниченные деплои
- ✅ Preview deployments

**Для админки этого более чем достаточно!**

### Vercel Postgres (если используете):

- **Бесплатно**: 256 MB хранилища, 60 часов compute
- **Pro**: $20/мес за больше ресурсов

### Альтернативы БД (бесплатные):

- Supabase: 500 MB бесплатно
- Railway: $5 кредитов в месяц
- ElephantSQL: 20 MB бесплатно (для теста)

---

## 🔄 Обновление деплоя

### Автоматическое (рекомендуется):

Просто запушьте изменения в ветку:

```bash
git add .
git commit -m "Update admin panel"
git push origin claude/analyze-architecture-diagram-01SyTTZzk2snpS7urgBxqds6
```

Vercel автоматически задеплоит новую версию!

### Ручное:

1. Vercel Dashboard
2. Deployments
3. Выберите нужный деплой
4. Нажмите Redeploy

---

## ✅ Чеклист успешного деплоя

- [ ] База данных создана и доступна
- [ ] DATABASE_URL добавлен в Environment Variables
- [ ] Все JWT и Admin секреты сгенерированы и добавлены
- [ ] Build прошёл успешно
- [ ] Deployment завершён
- [ ] Таблицы созданы в БД (SQL скрипт выполнен)
- [ ] Админ пользователь создан
- [ ] Можете зайти на /admin
- [ ] Логин работает
- [ ] Видите список пользователей/постов/отзывов
- [ ] Можете редактировать данные
- [ ] Изменили пароль по умолчанию

---

## 🎉 Готово!

Теперь у вас есть:

✅ **Рабочая админка** на Vercel
✅ **Веб-ссылка** которой можно делиться
✅ **Автоматические деплои** при push
✅ **HTTPS** из коробки
✅ **Глобальный CDN** Vercel
✅ **Бесплатный хостинг** (в пределах лимитов)

**Ваша админка:** `https://your-project.vercel.app/admin`

---

## 📚 Дополнительные ресурсы

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [AdminJS Documentation](https://docs.adminjs.co)
- [NestJS на Vercel](https://vercel.com/guides/deploying-nestjs-with-vercel)

---

## 🆘 Нужна помощь?

1. Проверьте логи в Vercel Dashboard
2. Посмотрите секцию Troubleshooting выше
3. Проверьте что все environment variables добавлены
4. Убедитесь что БД доступна и таблицы созданы

**Удачи с админкой! 🚀**
