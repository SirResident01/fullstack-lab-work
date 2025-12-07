# 🚀 Создание отдельного репозитория для фронтенда

## 📋 Инструкция по созданию нового репозитория

### Шаг 1: Создать новый репозиторий на GitHub

1. Откройте [GitHub](https://github.com)
2. Нажмите **"New repository"** (или перейдите по ссылке: https://github.com/new)
3. Заполните:
   - **Repository name:** `frontend` (или `fullstack-lab-work-frontend`)
   - **Description:** `Frontend for Car Management System (Next.js)`
   - **Visibility:** Public или Private (на ваш выбор)
   - **НЕ добавляйте** README, .gitignore, license (создадим сами)
4. Нажмите **"Create repository"**

### Шаг 2: Подготовить файлы для фронтенда

Создайте новую папку и скопируйте только фронтенд файлы:

```bash
# Создать новую папку для фронтенда
cd ..
mkdir frontend
cd frontend

# Инициализировать git
git init
git branch -M main
```

### Шаг 3: Скопировать файлы

Скопируйте следующие файлы и папки из текущего проекта:

**Обязательные файлы:**
- `package.json`
- `package-lock.json`
- `next.config.js`
- `tsconfig.json`
- `tailwind.config.js`
- `postcss.config.js`
- `vitest.config.ts`
- `next-env.d.ts`
- `env.production`
- `env.production.example`
- `VERCEL_DEPLOYMENT_COMPLETE.md`

**Папки:**
- `pages/` (вся папка)
- `components/` (вся папка)
- `lib/` (вся папка)
- `contexts/` (вся папка)
- `hooks/` (вся папка)
- `types/` (вся папка)
- `styles/` (вся папка)
- `public/` (вся папка)
- `tests/` (вся папка)

**НЕ копируйте:**
- `app/` (бэкенд)
- `auth_app/` (бэкенд)
- `venv/` (Python виртуальное окружение)
- `requirements.txt` (Python зависимости)
- `run.py` (Python скрипт)
- `*.py` файлы (кроме если есть в tests)
- `*.sql` файлы
- `*.db` файлы
- `Dockerfile.backend`
- `docker-compose.yml`
- `railway.json`
- `start.sh`
- Все `.md` файлы кроме `VERCEL_DEPLOYMENT_COMPLETE.md`

### Шаг 4: Создать .gitignore для фронтенда

Создайте файл `.gitignore` в новом репозитории:

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output

# Next.js
.next/
out/
build/
dist/

# Production
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.production

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local development
.cache/
.parcel-cache/
```

### Шаг 5: Создать README.md

Создайте `README.md` в новом репозитории:

```markdown
# 🚗 Car Management System - Frontend

Frontend приложение для системы управления автомобилями, построенное на Next.js и React.

## 🚀 Технологии

- **Next.js 14** - React фреймворк
- **TypeScript** - Типизация
- **Tailwind CSS** - Стилизация
- **React Query** - Управление состоянием и кэширование
- **Axios** - HTTP клиент

## 📦 Установка

```bash
npm install
```

## 🛠️ Разработка

```bash
npm run dev
```

Приложение будет доступно на http://localhost:3000

## 🏗️ Сборка

```bash
npm run build
npm start
```

## 🧪 Тестирование

```bash
npm test
```

## 🌐 Деплой

Приложение деплоится на [Vercel](https://vercel.com).

**Production URL:** https://fullstack-lab-work.vercel.app

**Backend API:** https://fullstack-lab-work-123.up.railway.app

## 📝 Переменные окружения

Для production на Vercel установите:

- `NEXT_PUBLIC_API_URL` - URL бэкенд API

## 📚 Документация

Подробная инструкция по деплою: [VERCEL_DEPLOYMENT_COMPLETE.md](./VERCEL_DEPLOYMENT_COMPLETE.md)
```

### Шаг 6: Закоммитить и запушить

```bash
# Добавить все файлы
git add .

# Создать первый коммит
git commit -m "Initial commit: Frontend for Car Management System"

# Добавить remote (замените YOUR_USERNAME на ваш GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/frontend.git

# Запушить
git push -u origin main
```

### Шаг 7: Подключить к Vercel

1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Нажмите **"Add New Project"**
3. Выберите новый репозиторий `frontend`
4. Vercel автоматически определит Next.js
5. Добавьте переменную окружения:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://fullstack-lab-work-123.up.railway.app`
6. Нажмите **"Deploy"**

## ✅ Готово!

Теперь у вас есть:
- ✅ Отдельный репозиторий для фронтенда
- ✅ Подключение к Vercel
- ✅ Готовый к деплою код

