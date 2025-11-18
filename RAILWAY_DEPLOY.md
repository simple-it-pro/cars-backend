# Развертывание Cars Backend на Railway.app

## ✨ Почему Railway.app?

- ✅ **Веб-интерфейс** - все настройки через браузер, CLI не нужен
- ✅ **GitHub деплой** - автоматически деплоит при пуше в репозиторий
- ✅ **AdminJS 7 поддержка** - полный Node.js runtime, ESM работает
- ✅ **Бесплатно** - $5 credit/месяц (достаточно для тестирования)
- ✅ **Логи в реальном времени** - удобный веб-интерфейс для мониторинга

---

## 🚀 Пошаговая инструкция (только браузер!)

### Шаг 1: Регистрация на Railway

1. Откройте https://railway.app
2. Нажмите **"Start a New Project"** (справа вверху)
3. Войдите через **GitHub** (обязательно GitHub для авто-деплоя)
4. Разрешите Railway доступ к вашим репозиториям

### Шаг 2: Создание проекта

1. Нажмите **"+ New Project"**
2. Выберите **"Deploy from GitHub repo"**
3. Найдите репозиторий **`simple-it-pro/cars-backend`**
4. Выберите ветку **`claude/vercel-deployment-ready-01SyTTZzk2snpS7urgBxqds6`**
5. Нажмите **"Deploy Now"**

Railway автоматически:
- Определит Node.js проект
- Установит зависимости (`yarn install`)
- Соберет проект (`yarn build`)
- Запустит приложение

### Шаг 3: Настройка переменных окружения

После создания проекта, перейдите во вкладку **"Variables"**:

#### 1. База данных (Supabase - та же, что на Vercel)

```
DB_URL = postgresql://postgres.xxx:[ВАШ_ПАРОЛЬ]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
DB_SCHEMA = public
```

> ⚠️ **Важно:** Используйте **Transaction Pooler** (порт 6543), не Direct Connection!

#### 2. JWT токены

```
JWT_ACCESS_SECRET = ваш-секретный-ключ
JWT_ACCESS_EXPIRATION_TIME = 3600
JWT_REFRESH_SECRET = ваш-рефреш-ключ
JWT_REFRESH_EXPIRATION_TIME = 86400
```

#### 3. SMS (опционально)

```
SMS_RU_API_ID =
SMS_TEST_MODE = true
```

#### 4. S3 Storage (опционально)

```
S3_ACCESS_KEY = dummy-key
S3_SECRET_KEY = dummy-secret
S3_BUCKET_NAME = dummy-bucket
S3_API_ENDPOINT = https://s3.amazonaws.com
S3_REGION = us-east-1
```

#### 5. Node.js настройки

```
NODE_ENV = production
PORT = 3000
```

### Шаг 4: Настройка домена (опционально)

1. Откройте вкладку **"Settings"**
2. Найдите секцию **"Domains"**
3. Нажмите **"Generate Domain"**

Railway создаст домен вида: `your-app.up.railway.app`

### Шаг 5: Ждем деплоя

1. Откройте вкладку **"Deployments"**
2. Наблюдайте за прогрессом в реальном времени
3. Когда статус станет **"Success"** - готово!

### Шаг 6: Открываем AdminJS

```
https://your-app.up.railway.app/admin
```

Или перейдите в **"Settings" → "Domains"** и кликните на ваш домен.

---

## 🎯 Доступные эндпоинты

После успешного деплоя:

| Эндпоинт | URL | Описание |
|----------|-----|----------|
| **API** | `/api` | Swagger документация |
| **AdminJS** | `/admin` | Панель администратора |
| **Health** | `/health` | Проверка работоспособности |
| **Root** | `/` | Информация о статусе API |

---

## 📊 Мониторинг и логи

### Просмотр логов

1. Откройте вкладку **"Deployments"**
2. Кликните на последний деплой
3. Откройте вкладку **"Logs"**
4. Логи обновляются в реальном времени

### Метрики

1. Откройте вкладку **"Metrics"**
2. Смотрите:
   - CPU usage
   - Memory usage
   - Network traffic

### Перезапуск сервиса

1. Откройте вкладку **"Settings"**
2. Нажмите **"Restart Deployment"**

---

## 🏗️ Архитектура после развертывания

```
┌──────────────────────────────────┐
│  GitHub Pages                    │
│  HTML Admin Panel (доп.)         │
│  simple-it-pro.github.io/        │
│  cars-backend/                   │
└──────────────────────────────────┘
                  │
    ┌─────────────┴──────────────┐
    │                            │
    ▼                            ▼
┌─────────────┐         ┌────────────────┐
│  Vercel     │         │  Railway.app   │
│  API Only   │         │  Full App      │
│  /api       │         │  /admin + /api │
└─────────────┘         └────────────────┘
       │                        │
       └────────┬───────────────┘
                ▼
        ┌──────────────┐
        │  Supabase    │
        │  PostgreSQL  │
        └──────────────┘
```

**Два деплоя работают параллельно:**
- **Vercel** - быстрый serverless API (без AdminJS)
- **Railway** - полное приложение с AdminJS (полный Node.js)

---

## 🔧 Troubleshooting

### Ошибка при сборке: "Module not found"

**Решение:** Проверьте, что все зависимости в `package.json`:
1. Откройте вкладку **"Deployments"**
2. Найдите ошибку в логах
3. Если нужно - добавьте недостающий пакет в `package.json`

### База данных не подключается

**Проверьте:**
1. ✅ Используете порт **6543** (Transaction Pooler), не 5432
2. ✅ URL начинается с `postgresql://` (не `postgres://`)
3. ✅ Пароль корректный (без спецсимволов в URL - закодируйте их)

**Кодирование спецсимволов в пароле:**
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`

### AdminJS показывает пустую страницу

**Решение:**
1. Откройте **Logs**
2. Проверьте ошибки TypeORM connection
3. Убедитесь, что миграции выполнены на Supabase

### Приложение падает после деплоя

**Проверьте переменные:**
1. Все переменные из списка выше установлены?
2. `DB_URL` правильный?
3. `JWT_ACCESS_SECRET` установлен?

### Недостаточно памяти (Out of Memory)

**Решение:**
1. Откройте **"Settings"**
2. Найдите **"Memory Limit"**
3. Увеличьте до 1GB (может потребовать платный план)

---

## 💰 Стоимость

### Бесплатный план (Trial)

- **$5 credit при регистрации**
- Обычно хватает на 2-4 недели тестирования
- Один активный проект

### Hobby план ($5/месяц)

- Неограниченные проекты
- 512MB RAM на сервис
- 100GB egress traffic
- Подходит для небольших админок

### Pro план ($20/месяц)

- 8GB RAM
- Priority support
- Подходит для продакшена

---

## 🔄 Автоматический деплой

Railway автоматически деплоит при каждом пуше в ветку!

**Как это работает:**
1. Вы пушите код в GitHub
2. Railway видит изменения
3. Автоматически запускается новый деплой
4. Через 2-3 минуты изменения живые

**Отключить авто-деплой:**
1. **Settings** → **Service Settings**
2. Найдите **"Automatic Deployments"**
3. Выключите toggle

---

## 🎓 Полезные команды (опционально)

Railway CLI не обязателен, но если хотите:

```bash
# Установка
npm install -g @railway/cli

# Логин
railway login

# Логи в реальном времени
railway logs

# Открыть проект в браузере
railway open
```

---

## 📚 Дополнительные ресурсы

- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status](https://status.railway.app)

---

## ✅ Checklist перед деплоем

- [ ] GitHub репозиторий доступен Railway
- [ ] Ветка `claude/vercel-deployment-ready-01SyTTZzk2snpS7urgBxqds6` выбрана
- [ ] Все переменные окружения установлены
- [ ] DB_URL использует порт 6543 (Transaction Pooler)
- [ ] JWT secrets установлены
- [ ] Домен сгенерирован

---

## 🎉 После успешного деплоя

**Протестируйте:**

1. **Root:** `https://your-app.up.railway.app/` → должен вернуть статус API
2. **Health:** `/health` → `{"status":"healthy"}`
3. **API:** `/api` → Swagger UI
4. **Admin:** `/admin` → AdminJS интерфейс с таблицами

**Готово!** Теперь у вас:
- ✅ Работающий API
- ✅ Красивая AdminJS панель
- ✅ Автоматический деплой при пуше
- ✅ Логи в реальном времени
