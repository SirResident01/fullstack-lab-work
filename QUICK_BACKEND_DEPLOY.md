# ⚡ Быстрый деплой Backend на Railway (5 минут)

## 🚀 Самый простой способ

### Шаг 1: Подготовка (1 минута)

1. Убедитесь, что код залит в GitHub
2. Проверьте, что есть `Dockerfile.backend` ✅

### Шаг 2: Деплой на Railway (3 минуты)

1. Зайдите на [railway.app](https://railway.app)
2. Нажмите **"Start a New Project"**
3. Выберите **"Deploy from GitHub repo"**
4. Выберите ваш репозиторий
5. Railway автоматически определит `Dockerfile.backend`
6. Нажмите **"Deploy"**

### Шаг 3: Добавление PostgreSQL (1 минута)

1. В Railway Dashboard нажмите **"+ New"**
2. Выберите **"Database"** → **"Add PostgreSQL"**
3. Railway автоматически создаст переменную `DATABASE_URL`

### Шаг 4: Настройка переменных окружения (1 минута)

В настройках проекта → **Variables** добавьте:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
SECRET_KEY=your-very-secure-secret-key-min-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=https://fullstack-lab-work.vercel.app,https://fullstack-lab-work-oajjvn4s2-llls-projects-d13c13b6.vercel.app
```

### Шаг 5: Получение URL

После деплоя Railway даст вам URL вида:
```
https://your-project-name.up.railway.app
```

**Скопируйте этот URL!**

### Шаг 6: Обновление Frontend

1. Зайдите в **Vercel Dashboard**
2. **Settings** → **Environment Variables**
3. Обновите `NEXT_PUBLIC_API_BASE_URL`:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-project-name.up.railway.app
   ```
4. Нажмите **"Redeploy"**

### Готово! 🎉

Теперь ваш frontend на Vercel подключен к backend на Railway!

---

## 🔧 Альтернатива: Render (Бесплатный)

1. Зайдите на [render.com](https://render.com)
2. **New +** → **Web Service**
3. Подключите GitHub репозиторий
4. Настройки:
   - **Environment:** `Docker`
   - **Dockerfile Path:** `Dockerfile.backend`
5. **New +** → **PostgreSQL** (для базы данных)
6. Добавьте переменные окружения (как выше)

---

Подробная инструкция: см. `BACKEND_DEPLOY.md`

