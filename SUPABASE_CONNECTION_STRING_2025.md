# Как получить Connection String из Supabase (2025)

## ✅ ПРАВИЛЬНЫЙ способ получить connection string

Интерфейс Supabase обновился! Теперь connection string находится в другом месте.

### 📍 Шаг 1: Откройте ваш проект в Supabase

1. Перейдите на https://supabase.com/dashboard
2. Выберите ваш проект (например, `cars-backend`)

### 📍 Шаг 2: Нажмите кнопку "Connect"

1. В **правом верхнем углу** экрана найдите кнопку **"Connect"** (зеленая кнопка)
2. Нажмите на неё

![Connect button location]
```
┌─────────────────────────────────────────────────────┐
│  🏠 Home    📊 Project     [Connect] 👤 Profile    │  ← Кнопка здесь!
├─────────────────────────────────────────────────────┤
│                                                      │
│  Your Project Dashboard                             │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 📍 Шаг 3: Выберите "Connection string"

После нажатия на "Connect" откроется модальное окно с несколькими вкладками:
- Connection string
- Connection pooler
- Direct connection
- и другие...

Выберите вкладку **"Connection string"** или **"Connection pooler"**

### 📍 Шаг 4: Выберите правильный тип подключения

Supabase предлагает 3 типа подключений:

```
┌─────────────────────────────────────────────────────┐
│  Connection String Types:                           │
│                                                      │
│  1️⃣ Direct Connection                              │
│     └─ Для долгих persistent connections (VM)       │
│                                                      │
│  2️⃣ Transaction Pooler ⭐ ИСПОЛЬЗУЙТЕ ЭТОТ         │
│     └─ Для serverless и edge functions (Vercel!)    │
│                                                      │
│  3️⃣ Session Pooler                                 │
│     └─ Для session-based connections                │
└─────────────────────────────────────────────────────┘
```

**ДЛЯ VERCEL ВЫБЕРИТЕ: Transaction Pooler** ⚡

### 📍 Шаг 5: Скопируйте URI

1. В выпадающем списке выберите **"Transaction"** или **"Transaction Pooler"**
2. Выберите режим **"URI"** (не PSQL, не другие форматы)
3. Нажмите кнопку **"Copy"** или скопируйте строку вручную

Строка будет выглядеть так:
```
postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

### 📍 Шаг 6: Замените пароль

**ВАЖНО!** В скопированной строке есть `[YOUR-PASSWORD]` - это НЕ ваш реальный пароль!

1. Найдите `[YOUR-PASSWORD]` в строке
2. Замените его на пароль, который вы указали при создании проекта
3. Если забыли пароль - можно сбросить (см. ниже)

**Пример:**

❌ **Неправильно** (с плейсхолдером):
```
postgresql://postgres.abc:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

✅ **Правильно** (с реальным паролем):
```
postgresql://postgres.abc:MySuper$ecretP@ss123@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

---

## 🔄 Альтернативный способ (через Settings)

Если не нашли кнопку "Connect", можно найти через настройки:

1. Откройте ваш проект в Supabase
2. Нажмите на иконку **⚙️ Settings** (в левом нижнем углу)
3. Выберите **Database** в меню слева
4. Прокрутите вниз до секции **"Connection string"**
5. Выберите **"Transaction"** или **"URI"**
6. Скопируйте строку

---

## 🔑 Если забыли пароль от базы данных

### Вариант 1: Сбросить пароль

1. Settings → Database
2. Найдите секцию **"Database Password"**
3. Нажмите **"Reset database password"**
4. Введите новый пароль
5. Подтвердите
6. **ВАЖНО**: Обновите пароль во всех местах, где используется старый!

### Вариант 2: Найти в истории

Если вы сохраняли пароль при создании проекта:
- Проверьте email от Supabase
- Проверьте менеджер паролей
- Проверьте локальный .env файл

---

## 🎯 Итоговая инструкция для Vercel

После того как получили connection string:

1. **Скопируйте connection string** (Transaction Pooler, URI)
2. **Замените `[YOUR-PASSWORD]`** на реальный пароль
3. **Откройте Vercel Dashboard** → ваш проект
4. **Settings** → **Environment Variables**
5. Найдите **DB_URL** → **⋯** → **Edit**
6. **Вставьте** connection string (с замененным паролем!)
7. **Save**
8. **Deployments** → последний деплой → **⋯** → **Redeploy**

---

## 📊 Сравнение типов подключений

| Тип | Когда использовать | Для Vercel? |
|-----|-------------------|-------------|
| **Direct Connection** | VM, долгие соединения, IPv6 | ❌ НЕТ |
| **Transaction Pooler** | Serverless, Edge Functions | ✅ **ДА** |
| **Session Pooler** | Session-based приложения | ⚠️ Можно, но Transaction лучше |

**Для Vercel всегда используйте Transaction Pooler!**

---

## 🔍 Как проверить, что строка правильная

Правильная строка для Transaction Pooler должна:
- ✅ Начинаться с `postgresql://`
- ✅ Содержать `pooler.supabase.com`
- ✅ Использовать порт `:6543` (НЕ :5432!)
- ✅ Иметь реальный пароль (НЕ `[YOUR-PASSWORD]`)

**Пример правильной строки:**
```
postgresql://postgres.projectref:RealPassword123@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

---

## ❓ Частые вопросы

### Q: Какой порт использовать - 5432 или 6543?

**A:** Для Transaction Pooler (Vercel) используйте **6543**.
- `5432` - это Direct Connection (не подходит для serverless)
- `6543` - это Transaction Pooler (подходит для Vercel)

### Q: Нужно ли добавлять `?sslmode=require`?

**A:** Нет, Supabase автоматически использует SSL. Но если хотите явно указать:
```
postgresql://...postgres?sslmode=require
```

### Q: Где взять password, если в строке `[YOUR-PASSWORD]`?

**A:** Это пароль, который вы указали при создании проекта Supabase. Если забыли - сбросьте через Settings → Database → Reset database password.

### Q: Можно ли использовать один connection string для всех окружений?

**A:** Да, можно использовать одну и ту же строку для production, preview и development в Vercel.

---

## ✅ Чеклист перед деплоем

- [ ] Получил connection string из Supabase (кнопка Connect)
- [ ] Выбрал **Transaction Pooler** (НЕ Direct Connection)
- [ ] Выбрал формат **URI**
- [ ] Заменил `[YOUR-PASSWORD]` на реальный пароль
- [ ] Вставил в Vercel (Settings → Environment Variables → DB_URL → Edit)
- [ ] Сохранил переменную
- [ ] Сделал Redeploy в Vercel
- [ ] Выполнил SQL скрипт `setup-free-db.sql` в Supabase SQL Editor

После всех шагов админка должна работать на `https://ваш-проект.vercel.app/admin` 🎉

---

## 🆘 Всё ещё не можете найти?

**Скриншоты помогут!** Пришлите скриншот вашего Supabase Dashboard, и я подскажу, где именно искать.

Или попробуйте:
1. Обновить страницу Supabase Dashboard (Ctrl+F5)
2. Выйти и войти заново
3. Проверить, что проект полностью создан (статус: Active)
