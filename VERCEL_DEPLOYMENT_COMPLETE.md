# 🚀 Полное подключение Frontend (Vercel) к Backend (Railway)

## ✅ Выполненные изменения

### 1. Файл `.env.production`

**Создан/обновлен:** `env.production`

```bash
# Production Environment Variables for Vercel
# This file is for reference. On Vercel, set these in Project Settings → Environment Variables

# Backend API URL (Railway production)
NEXT_PUBLIC_API_URL=https://fullstack-lab-work-123.up.railway.app
```

**⚠️ Важно:** Этот файл НЕ коммитится в git (в .gitignore). На Vercel нужно добавить переменную вручную.

---

### 2. API Client (`lib/api.ts`)

**Файл:** `lib/api.ts`

```typescript
import axios, { AxiosInstance, AxiosResponse } from 'axios';
// ... other imports

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    // Use NEXT_PUBLIC_API_URL for production, fallback to localhost for development
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
    
    this.client = axios.create({
      baseURL: apiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // ... все методы API (getCars, createCar, login, etc.)
}

// Create singleton instance
export const apiClient = new ApiClient();
export default apiClient;
```

**Как работает:**
- В production (Vercel): использует `NEXT_PUBLIC_API_URL` → `https://fullstack-lab-work-123.up.railway.app`
- В development: использует `http://127.0.0.1:8000` (локальный бэкенд)

**✅ Хардкод удален:** Все запросы идут через переменную окружения.

---

### 3. Backend CORS (`app/main.py`)

**Файл:** `app/main.py`

```python
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title=APP_NAME, version=APP_VERSION)

# CORS настройки
# Получаем CORS origins из переменных окружения или используем дефолтные
cors_origins_env = os.getenv("CORS_ORIGINS", "")
if cors_origins_env:
    cors_origins = [origin.strip() for origin in cors_origins_env.split(",")]
else:
    # Дефолтные значения для разработки + Vercel домены
    cors_origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "https://fullstack-lab-work.vercel.app",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Что настроено:**
- ✅ Разрешен домен Vercel: `https://fullstack-lab-work.vercel.app`
- ✅ Оставлен localhost для разработки
- ✅ Разрешены все методы (`allow_methods=["*"]`)
- ✅ Разрешены все заголовки (`allow_headers=["*"]`)
- ✅ Разрешены credentials (`allow_credentials=True`)

**Альтернатива через переменную окружения (Railway):**

Если нужно добавить дополнительные домены, в Railway Backend Service → Variables:
- **Key:** `CORS_ORIGINS`
- **Value:** `https://fullstack-lab-work.vercel.app,http://localhost:3000`

---

### 4. Next.js Config (`next.config.js`)

**Файл:** `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Для Docker
  images: {
    domains: ['localhost'],
  },
  env: {
    // Это для обратной совместимости, но лучше использовать NEXT_PUBLIC_API_URL
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8000',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
```

**Примечание:** `env.API_BASE_URL` оставлен для обратной совместимости, но основной используется `NEXT_PUBLIC_API_URL` в `lib/api.ts`.

---

## 📋 Инструкции для Vercel

### Шаг 1: Добавить переменную окружения

1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите ваш проект: `fullstack-lab-work`
3. Перейдите в **Settings** → **Environment Variables**
4. Нажмите **Add New**
5. Заполните:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://fullstack-lab-work-123.up.railway.app`
   - **Environment:** Выберите `Production`, `Preview`, и `Development` (или только `Production`)
6. Нажмите **Save**

### Шаг 2: Перезапустить деплой

**Вариант 1: Через Dashboard**
1. Перейдите в **Deployments**
2. Найдите последний деплой
3. Нажмите **⋯** (три точки) → **Redeploy**
4. Подтвердите перезапуск

**Вариант 2: Через Git Push**
```bash
# Сделайте любой коммит и пуш
git commit --allow-empty -m "Trigger Vercel redeploy"
git push origin main
```

**Вариант 3: Через Vercel CLI**
```bash
vercel --prod
```

### Шаг 3: Проверить деплой

1. Дождитесь завершения деплоя (обычно 1-3 минуты)
2. Откройте ваш сайт: `https://fullstack-lab-work.vercel.app`
3. Откройте **Developer Tools** (F12) → **Console**
4. Проверьте, что нет ошибок CORS
5. Проверьте Network tab - запросы должны идти на `https://fullstack-lab-work-123.up.railway.app`

---

## ✅ Проверка работоспособности

### Тест 1: Проверка переменной окружения

В браузере на `https://fullstack-lab-work.vercel.app`:
```javascript
// В консоли браузера
console.log(process.env.NEXT_PUBLIC_API_URL);
// Должно вывести: https://fullstack-lab-work-123.up.railway.app
```

### Тест 2: Проверка API запросов

В Network tab браузера:
- Запросы должны идти на: `https://fullstack-lab-work-123.up.railway.app`
- НЕ должно быть запросов на `localhost:8000` или `127.0.0.1:8000`

### Тест 3: Проверка CORS

В консоли браузера НЕ должно быть ошибок типа:
```
Access to fetch at 'https://fullstack-lab-work-123.up.railway.app/...' 
from origin 'https://fullstack-lab-work.vercel.app' has been blocked by CORS policy
```

### Тест 4: Функциональные тесты

1. **Авторизация:**
   - Зарегистрируйтесь или войдите
   - Должно работать без ошибок

2. **Загрузка данных:**
   - Откройте страницу с автомобилями/владельцами
   - Данные должны загрузиться

3. **Создание/редактирование:**
   - Создайте новый автомобиль/владельца
   - Должно сохраниться в базе

---

## 🔧 Troubleshooting

### Проблема: "API requests go to localhost"

**Решение:**
1. Проверьте, что `NEXT_PUBLIC_API_URL` установлена в Vercel
2. Убедитесь, что переменная доступна для Production environment
3. Перезапустите деплой

### Проблема: CORS ошибки

**Решение:**
1. Проверьте, что в `app/main.py` есть `https://fullstack-lab-work.vercel.app` в `cors_origins`
2. Убедитесь, что бэкенд перезапущен после изменений
3. Проверьте Railway logs на наличие ошибок

### Проблема: "Environment variable not found"

**Решение:**
1. В Vercel убедитесь, что переменная называется именно `NEXT_PUBLIC_API_URL` (с префиксом `NEXT_PUBLIC_`)
2. Переменные без `NEXT_PUBLIC_` не доступны в браузере
3. Перезапустите деплой после добавления переменной

---

## 📝 Итоговый чеклист

- [x] Создан `.env.production` с правильным URL
- [x] Обновлен `lib/api.ts` для использования `NEXT_PUBLIC_API_URL`
- [x] Удалены хардкоды localhost из production кода
- [x] Обновлен CORS в `app/main.py` для Vercel домена
- [x] Настроены все методы и заголовки CORS
- [ ] Добавлена переменная `NEXT_PUBLIC_API_URL` в Vercel
- [ ] Перезапущен деплой на Vercel
- [ ] Проверена работоспособность API
- [ ] Проверено отсутствие CORS ошибок

---

## 🔗 Полезные ссылки

- **Frontend:** https://fullstack-lab-work.vercel.app
- **Backend API:** https://fullstack-lab-work-123.up.railway.app
- **API Docs:** https://fullstack-lab-work-123.up.railway.app/docs
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Railway Dashboard:** https://railway.app

---

## 📞 Финальная проверка

После выполнения всех шагов:

1. ✅ Frontend работает на Vercel
2. ✅ Backend работает на Railway
3. ✅ API запросы идут на Railway URL
4. ✅ Нет CORS ошибок
5. ✅ Авторизация работает
6. ✅ Данные загружаются и сохраняются

**Готово! 🎉**

