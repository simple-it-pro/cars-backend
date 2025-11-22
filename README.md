# Cars Admin Panel

Административная панель для управления пользователями приложения Cars.

## Структура проекта

```
├── admin/              # React админ-панель (Vite + Ant Design)
├── src/                # NestJS бэкенд
│   ├── admin/          # Модуль администрирования (CRUD пользователей)
│   ├── auth/           # Аутентификация по SMS
│   ├── users/          # Работа с профилем пользователя
│   ├── storage/        # Работа с S3 хранилищем
│   ├── sms/            # Отправка SMS
│   ├── shared/         # Общие модули (TypeORM, конфигурация)
│   ├── common/         # Константы и типы
│   └── database/       # Entities для TypeORM
└── .github/            # GitHub Actions workflows
```

## API Endpoints

### Auth (`/auth`)
- `POST /auth/request-code` - Запрос SMS кода
- `POST /auth/verify-code` - Верификация кода и получение токенов
- `POST /auth/refresh` - Обновление токенов
- `POST /auth/logout` - Выход

### Users (`/users`)
- `GET /users/me` - Получить профиль текущего пользователя
- `PATCH /users/me` - Обновить профиль
- `GET /users/getAll` - Список всех пользователей

### Admin (`/admin`)
- `GET /admin/users` - Список пользователей (ADMIN/ADVANCED)
- `POST /admin/users` - Создать пользователя
- `PATCH /admin/users/:id` - Обновить пользователя
- `DELETE /admin/users/:id` - Удалить пользователя

## Деплой

Деплой выполняется автоматически через GitHub Actions при пуше в ветку `dev-admin`.

- **Бэкенд**: PM2 на сервере 31.172.71.35
- **Админ-панель**: Статика в `/var/www/cars-admin/`
- **База данных**: PostgreSQL на удалённом сервере (Docker)

## Переменные окружения

```env
DB_URL=postgres://user:pass@host:port/database
DB_SCHEMA=cars
JWT_SECRET=secret
JWT_REFRESH_SECRET=refresh_secret
SMS_TEST_MODE=true
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET=...
S3_ENDPOINT=...
```

## Локальная разработка

```bash
# Установка зависимостей
yarn install

# Запуск бэкенда
yarn start:dev

# Запуск админ-панели
cd admin && yarn dev
```
