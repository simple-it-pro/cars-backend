# Развертывание AdminJS на Fly.io

## Почему Fly.io?

AdminJS несовместим с Vercel serverless из-за конфликта версий:
- TypeORM 0.3.x требует @adminjs/typeorm 4.x+
- @adminjs/typeorm 4.x+ требует AdminJS 7+ (ESM-only)
- Vercel serverless не поддерживает ESM должным образом

Fly.io поддерживает полный Node.js runtime и работает с AdminJS 7.

## Шаг 1: Установите Fly CLI

```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

## Шаг 2: Авторизуйтесь

```bash
fly auth login
```

Откроется браузер для входа/регистрации.

## Шаг 3: Включите AdminModule для Fly.io

Раскомментируйте AdminModule в `src/app.module.ts`:

```typescript
import { AdminModule } from './admin/admin.module';

@Module({
    imports: [
        // ... другие модули
        AdminModule, // Включите для Fly.io
        RouterModule.register(ROUTES),
    ],
})
```

## Шаг 4: Создайте приложение на Fly.io

```bash
fly apps create cars-backend-admin
```

## Шаг 5: Установите переменные окружения

```bash
# Database (используйте ту же Supabase БД)
fly secrets set DB_URL="postgresql://postgres.xxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
fly secrets set DB_SCHEMA="public"

# JWT
fly secrets set JWT_ACCESS_SECRET="ваш-секрет"
fly secrets set JWT_ACCESS_EXPIRATION_TIME="3600"
fly secrets set JWT_REFRESH_SECRET="ваш-рефреш-секрет"
fly secrets set JWT_REFRESH_EXPIRATION_TIME="86400"

# SMS (опционально)
fly secrets set SMS_RU_API_ID=""
fly secrets set SMS_TEST_MODE="true"

# S3 (опционально)
fly secrets set S3_ACCESS_KEY="dummy-key"
fly secrets set S3_SECRET_KEY="dummy-secret"
fly secrets set S3_BUCKET_NAME="dummy-bucket"
fly secrets set S3_API_ENDPOINT="https://s3.amazonaws.com"
fly secrets set S3_REGION="us-east-1"
```

## Шаг 6: Деплой

```bash
fly deploy
```

## Шаг 7: Откройте AdminJS

```bash
fly open
```

Или вручную: `https://cars-backend-admin.fly.dev/admin`

## Управление

```bash
# Логи
fly logs

# Статус
fly status

# SSH в контейнер
fly ssh console

# Масштабирование (если нужно)
fly scale memory 1024  # Увеличить RAM до 1GB
```

## Бесплатный план Fly.io

- 3 shared-cpu-1x VMs (256MB RAM каждая)
- 160GB transfer
- Автоматическая остановка при неактивности (auto_stop_machines)

## Архитектура после развертывания

```
┌─────────────────────────────────────────┐
│  Frontend (GitHub Pages)                │
│  https://simple-it-pro.github.io/       │
│  cars-backend/                          │
└─────────────────────────────────────────┘
                  │
    ┌─────────────┴─────────────┐
    │                           │
    ▼                           ▼
┌─────────────┐         ┌──────────────┐
│  Vercel     │         │  Fly.io      │
│  API Only   │         │  AdminJS     │
│  /api       │         │  /admin      │
└─────────────┘         └──────────────┘
       │                       │
       └───────────┬───────────┘
                   ▼
           ┌──────────────┐
           │  Supabase    │
           │  PostgreSQL  │
           └──────────────┘
```

## Примечания

- **Vercel**: API endpoints без AdminJS (быстрый, serverless)
- **Fly.io**: Полное приложение с AdminJS (полный Node.js)
- **База данных**: Одна и та же Supabase PostgreSQL для обоих

## Troubleshooting

### Ошибка при билде
```bash
fly logs
# Проверьте логи сборки
```

### База данных не подключается
Убедитесь, что используете Transaction Pooler (порт 6543), не Direct Connection (5432).

### Недостаточно памяти
```bash
fly scale memory 512
```
