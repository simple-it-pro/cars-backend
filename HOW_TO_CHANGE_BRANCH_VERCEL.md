# 🎯 Как изменить ветку для деплоя в Vercel

## ✅ Отлично! Вы нашли проблему - деплоилась main ветка!

В main нет кода для деплоя, поэтому и был 404. Нужно задеплоить ветку:
```
claude/vercel-deployment-ready-01SyTTZzk2snpS7urgBxqds6
```

---

## 🚀 Решение: 3 способа (от самого простого)

---

## ⭐ Способ 1: Создать деплой с выбором ветки (САМЫЙ ПРОСТОЙ)

### Шаг 1: Откройте страницу проекта
1. Vercel Dashboard: https://vercel.com/dashboard
2. Нажмите на ваш проект `cars-backend` (или как он у вас называется)

### Шаг 2: Создайте новый деплой
1. Перейдите на вкладку **Deployments** (в верхнем меню)
2. Нажмите кнопку **Create Deployment** (справа вверху, рядом с поиском)

### Шаг 3: Выберите ветку
В открывшемся окне:
1. **Import Git Repository** - уже выбран ваш репозиторий
2. Найдите выпадающий список **Git Branch** или просто поле с веткой
3. Нажмите на него - откроется список всех веток
4. Найдите и выберите:
   ```
   claude/vercel-deployment-ready-01SyTTZzk2snpS7urgBxqds6
   ```
5. Нажмите **Deploy**

### Шаг 4: Дождитесь деплоя
- Займет 3-5 минут
- Статус должен стать **Ready** (зелёный)

---

## 🔧 Способ 2: Через Deployments → Redeploy (если есть старый деплой этой ветки)

### Шаг 1: Найдите старый деплой нужной ветки
1. Vercel Dashboard → ваш проект
2. Вкладка **Deployments**
3. Прокрутите список деплоев вниз
4. Ищите деплой с веткой `claude/vercel-deployment-ready-...`

### Шаг 2: Redeploy
1. Нажмите на этот деплой
2. Справа вверху нажмите кнопку с тремя точками **⋯**
3. Выберите **Redeploy**
4. Подтвердите

---

## 🆕 Способ 3: Создать новый проект (если Способ 1 не работает)

Если не получается изменить ветку в текущем проекте, создайте новый:

### Шаг 1: Создайте новый проект
1. Vercel Dashboard: https://vercel.com/new
2. Нажмите **Continue with GitHub**

### Шаг 2: Импортируйте репозиторий
1. Найдите `simple-it-pro/cars-backend`
2. Нажмите **Import**

### Шаг 3: ВАЖНО - выберите ветку ПЕРЕД деплоем!
Перед тем как нажать Deploy:

1. Найдите секцию **Git** или **Branch**
2. Там должно быть поле с текущей веткой (main)
3. **Нажмите на него** - откроется выпадающий список
4. Выберите:
   ```
   claude/vercel-deployment-ready-01SyTTZzk2snpS7urgBxqds6
   ```

### Шаг 4: Настройте переменные окружения
Раскройте **Environment Variables** и добавьте:

```bash
DB_URL=postgresql://postgres.xxxxx:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
DB_SCHEMA=public
JWT_ACCESS_SECRET=any-random-string-32-chars
JWT_REFRESH_SECRET=another-random-string-32-chars
JWT_WEBSOCKET_SECRET=yet-another-random-string-32-chars
JWT_ACCESS_EXPIRES_IN=60m
JWT_REFRESH_EXPIRES_IN=30d
JWT_WEBSOCKET_EXPIRES_IN=24h
PORT=3000
NODE_ENV=production
SMS_TEST_MODE=true
```

### Шаг 5: Deploy
1. Нажмите **Deploy**
2. Дождитесь (3-5 минут)

---

## 📸 Где искать выбор ветки - визуально:

### В Create Deployment:
```
┌───────────────────────────────────────────┐
│  Import Git Repository                    │
│                                           │
│  simple-it-pro/cars-backend              │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │ Git Branch: main              [▼]   │ │ ← ВОТ ЗДЕСЬ!
│  └─────────────────────────────────────┘ │
│                                           │
│  [Deploy]                                 │
└───────────────────────────────────────────┘
```

### Или может выглядеть так:
```
┌───────────────────────────────────────────┐
│  Configure Project                        │
│                                           │
│  Branch: main                       [Edit]│ ← ИЛИ ЗДЕСЬ!
│                                           │
│  Build and Output Settings                │
└───────────────────────────────────────────┘
```

---

## 🔍 Если НЕ видите выбор ветки:

### Вариант А: Поищите вкладку "Production Branch"
Иногда она находится в:
- **Settings** → **Domains** → там может быть выбор ветки
- **Settings** → **General** → Production Branch

### Вариант Б: Используйте Vercel CLI (для продвинутых)
Если у вас установлен Node.js:

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите
vercel login

# Перейдите в папку проекта
cd /path/to/cars-backend

# Переключитесь на нужную ветку
git checkout claude/vercel-deployment-ready-01SyTTZzk2snpS7urgBxqds6

# Задеплойте
vercel --prod
```

---

## ✅ Как проверить что правильная ветка задеплоилась:

### После деплоя:
1. Откройте Vercel → ваш проект → **Deployments**
2. Кликните на последний деплой (самый верхний)
3. Под названием проекта должно быть:
   ```
   Branch: claude/vercel-deployment-ready-01SyTTZzk2snpS7urgBxqds6
   Commit: 90eb722 (или новее)
   ```

### Проверка в браузере:
Откройте:
```
https://ваш-проект.vercel.app/
```

**Должно показать:**
```json
{
  "status": "ok",
  "message": "Cars Backend API is running",
  "endpoints": {
    "api": "/api",
    "admin": "/admin"
  }
}
```

**Если видите это** - ВСЁ РАБОТАЕТ! ✅

Тогда админка будет тут:
```
https://ваш-проект.vercel.app/admin
```

---

## 🆘 Если всё равно не получается:

Напишите мне:
1. Скриншот страницы "Create Deployment" в Vercel
2. Или скриншот страницы создания нового проекта

Я покажу где именно искать выбор ветки! 🚀

---

## 💡 Подсказка:

Самый надёжный способ - **Способ 3** (создать новый проект).
Это займёт 5 минут и точно сработает:
1. New Project
2. Import cars-backend
3. Выбрать ветку `claude/vercel-deployment-ready-...`
4. Добавить переменные
5. Deploy

И всё! 🎉
