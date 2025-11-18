# Развертывание Cars Backend на Render.com

## ✨ Почему Render.com?

- ✅ **Веб-интерфейс** - все через браузер, CLI не нужен
- ✅ **GitHub деплой** - автоматически из репозитория
- ✅ **AdminJS 7 поддержка** - полный Node.js runtime
- ✅ **Бесплатно** - 750 часов/месяц на Free plan
- ✅ **Логи в реальном времени** - удобный дашборд

**Минусы бесплатного плана:**
- ⚠️ Засыпает после 15 минут неактивности
- ⚠️ Холодный старт ~30 секунд

---

## 🚀 Пошаговая инструкция (только веб-интерфейс!)

### Шаг 1: Регистрация на Render

1. Откройте https://render.com
2. Нажмите **"Get Started"** (справа вверху)
3. Войдите через **GitHub** (обязательно для авто-деплоя)
4. Разрешите Render доступ к репозиториям

---

### Шаг 2: Создание Web Service

1. В дашборде нажмите **"New +"** → **"Web Service"**
2. В списке репозиториев найдите **`simple-it-pro/cars-backend`**
   - Если не видите, нажмите **"Configure account"** → разрешите доступ
3. Нажмите **"Connect"** напротив репозитория

---

### Шаг 3: Настройка деплоя

Заполните форму:

#### **Name**
```
cars-backend
```
(или любое другое имя)

#### **Region**
```
Frankfurt (EU Central)
```
(ближайший к вам регион)

#### **Branch**
```
claude/vercel-deployment-ready-01SyTTZzk2snpS7urgBxqds6
```

#### **Root Directory**
Оставьте пустым

#### **Runtime**
```
Node
```
(Render автоматически определит)

#### **Build Command**
```
yarn install --frozen-lockfile && yarn build
```

#### **Start Command**
```
node dist/src/main.js
```

#### **Plan**
```
Free
```

---

### Шаг 4: Переменные окружения (Environment Variables)

Прокрутите вниз до секции **"Environment Variables"**.

Нажмите **"Add Environment Variable"** для каждой переменной:

#### 1. База данных (Supabase - та же, что на Vercel)

**DB_URL**
```
postgresql://postgres.xxx:[ВАШ_ПАРОЛЬ]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

**DB_SCHEMA**
```
public
```

> ⚠️ **Важно:** Используйте **Transaction Pooler** (порт **6543**), не Direct Connection!
>
> **Как получить:**
> 1. Supabase Dashboard → ваш проект
> 2. Нажмите **"Connect"** (справа вверху)
> 3. Выберите **"Transaction Pooler"**
> 4. Скопируйте URI

#### 2. JWT токены

**JWT_ACCESS_SECRET**
```
ваш-секретный-ключ
```

**JWT_ACCESS_EXPIRATION_TIME**
```
3600
```

**JWT_REFRESH_SECRET**
```
ваш-рефреш-ключ
```

**JWT_REFRESH_EXPIRATION_TIME**
```
86400
```

#### 3. SMS (опционально)

**SMS_RU_API_ID**
```
(оставьте пустым)
```

**SMS_TEST_MODE**
```
true
```

#### 4. S3 Storage (опционально)

**S3_ACCESS_KEY**
```
dummy-key
```

**S3_SECRET_KEY**
```
dummy-secret
```

**S3_BUCKET_NAME**
```
dummy-bucket
```

**S3_API_ENDPOINT**
```
https://s3.amazonaws.com
```

**S3_REGION**
```
us-east-1
```

#### 5. Node.js настройки

**NODE_ENV**
```
production
```

**PORT**
```
3000
```

---

### Шаг 5: Создать сервис

Прокрутите вниз и нажмите **"Create Web Service"**

Render начнет:
1. ✅ Клонирование репозитория
2. ✅ Установку зависимостей (`yarn install`)
3. ✅ Сборку проекта (`yarn build`)
4. ✅ Запуск приложения

**Время деплоя:** 3-5 минут

---

### Шаг 6: Следим за деплоем

1. Вы автоматически попадете на страницу деплоя
2. Внизу будут логи в реальном времени
3. Когда увидите **"Your service is live 🎉"** - готово!

---

### Шаг 7: Получаем URL

В верхней части страницы будет URL вида:
```
https://cars-backend-xxxx.onrender.com
```

Скопируйте его!

---

### Шаг 8: Открываем AdminJS

Откройте в браузере:
```
https://cars-backend-xxxx.onrender.com/admin
```

**Первый запуск может занять ~30 секунд** (холодный старт).

---

## 🎯 Доступные эндпоинты

После успешного деплоя:

| Эндпоинт | URL | Описание |
|----------|-----|----------|
| **Root** | `/` | Информация о статусе API |
| **Health** | `/health` | Проверка работоспособности |
| **API** | `/api` | Swagger документация |
| **AdminJS** | `/admin` | 🎉 Панель администратора |

---

## 📊 Мониторинг

### Просмотр логов

1. В дашборде откройте ваш сервис
2. Вкладка **"Logs"**
3. Логи в реальном времени

### Метрики

1. Вкладка **"Metrics"**
2. Смотрите:
   - CPU usage
   - Memory usage
   - Request count

### Ручной перезапуск

1. Откройте вкладку **"Manual Deploy"**
2. Нажмите **"Clear build cache & deploy"**

---

## 🏗️ Архитектура

```
┌──────────────────────────────────┐
│  GitHub Pages (опционально)      │
│  HTML Admin Panel                │
│  simple-it-pro.github.io/        │
│  cars-backend/                   │
└──────────────────────────────────┘
                  │
    ┌─────────────┴──────────────┐
    │                            │
    ▼                            ▼
┌─────────────┐         ┌────────────────┐
│  Vercel     │         │  Render.com    │
│  API Only   │         │  AdminJS + API │
│  Serverless │         │  Full Node.js  │
└─────────────┘         └────────────────┘
       │                        │
       └────────┬───────────────┘
                ▼
        ┌──────────────┐
        │  Supabase    │
        │  PostgreSQL  │
        └──────────────┘
```

---

## ⚠️ Важные моменты

### 1. Холодный старт на Free плане

Сервис засыпает после **15 минут** неактивности.

**Решение:** При первом запросе подождите 30 секунд.

**Как избежать (платно):**
- Upgrade на **Starter план** ($7/месяц) - сервис всегда активен

### 2. Автоматический деплой

Render **автоматически** деплоит при пуше в ветку!

**Отключить:**
1. Settings → Build & Deploy
2. **Auto-Deploy** → OFF

### 3. Ошибки деплоя

Если деплой упал:
1. Откройте **Logs**
2. Найдите красную ошибку
3. Обычно это:
   - Неправильный `DB_URL`
   - Отсутствует переменная `JWT_ACCESS_SECRET`
   - Опечатка в команде

---

## 🔧 Troubleshooting

### Ошибка: "Module not found"

**Решение:**
1. Проверьте Build Command:
   ```
   yarn install --frozen-lockfile && yarn build
   ```
2. Проверьте Start Command:
   ```
   node dist/src/main.js
   ```

### База данных не подключается

**Проверьте:**
- ✅ Порт **6543** (Transaction Pooler), не 5432
- ✅ URL начинается с `postgresql://`
- ✅ Пароль без спецсимволов (или закодирован)

**Кодирование спецсимволов:**
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`

### AdminJS показывает 500 ошибку

**Решение:**
1. Откройте **Logs**
2. Ищите ошибку TypeORM/AdminJS
3. Проверьте, что `DB_URL` правильный

### Приложение не отвечает

**Возможно засыпает:**
1. Подождите 30 секунд (холодный старт)
2. Обновите страницу

**Если долго не отвечает:**
1. Проверьте **Health Check:** `/health`
2. Проверьте логи на ошибки

---

## 💰 Стоимость

### Free план (бесплатно)

- ✅ 750 часов/месяц
- ✅ 512MB RAM
- ✅ Shared CPU
- ⚠️ Засыпает после 15 мин
- ⚠️ Холодный старт ~30 сек

**Достаточно для:**
- Тестирования
- Демо-проектов
- Легких админок

### Starter план ($7/месяц)

- ✅ Всегда активен (no sleep)
- ✅ 512MB RAM
- ✅ Instant deployments
- ✅ Подходит для небольших проектов

### Pro план ($25/месяц)

- ✅ 2GB RAM
- ✅ Priority support
- ✅ Подходит для продакшена

---

## 🔄 Обновление приложения

**Автоматически:**
1. Пушите в ветку `claude/vercel-deployment-ready-01SyTTZzk2snpS7urgBxqds6`
2. Render видит изменения
3. Автоматический деплой (~3 минуты)

**Вручную:**
1. Dashboard → ваш сервис
2. **Manual Deploy** → **Deploy latest commit**

---

## 📚 Полезные ссылки

- [Render Docs](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Render Status](https://status.render.com)

---

## ✅ Checklist перед деплоем

- [ ] Зарегистрировались на Render через GitHub
- [ ] Репозиторий `cars-backend` доступен
- [ ] Выбрана правильная ветка
- [ ] Все переменные окружения добавлены
- [ ] DB_URL использует порт 6543
- [ ] JWT_ACCESS_SECRET установлен
- [ ] Build Command: `yarn install --frozen-lockfile && yarn build`
- [ ] Start Command: `node dist/src/main.js`

---

## 🎉 После успешного деплоя

**Протестируйте все эндпоинты:**

1. **Root:** `https://your-app.onrender.com/`
   - Должен вернуть: `{"status":"ok","message":"Cars Backend API is running"}`

2. **Health:** `/health`
   - Должен вернуть: `{"status":"healthy","uptime":123}`

3. **Swagger:** `/api`
   - Должен показать Swagger UI с иконкой машинки 🚗

4. **AdminJS:** `/admin`
   - Должен показать AdminJS интерфейс со всеми таблицами

---

## 🚨 Если что-то не работает

1. Проверьте **Logs** в Render Dashboard
2. Проверьте все переменные окружения
3. Попробуйте **Clear build cache & deploy**
4. Напишите мне - помогу разобраться!

---

**Готово!** Теперь у вас AdminJS работает на Render.com 🎉
