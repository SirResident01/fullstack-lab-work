# 🚀 Руководство по деплою приложения

## 📋 Варианты хостинга

### 1. **Vercel** (Рекомендуется для Next.js) ⭐
### 2. **Netlify** (Уже настроен)
### 3. **Docker на VPS** (DigitalOcean, AWS EC2, etc.)

---

## 🌟 Вариант 1: Vercel (Самый простой для Next.js)

### Преимущества:
- ✅ Бесплатный тариф
- ✅ Автоматический деплой из Git
- ✅ Отличная поддержка Next.js
- ✅ CDN и оптимизация из коробки
- ✅ SSL сертификаты автоматически

### Шаги деплоя:

#### 1. Подготовка проекта

Убедитесь, что проект готов к деплою:
```bash
npm run build
```

#### 2. Деплой через Vercel Dashboard

1. Зайдите на [vercel.com](https://vercel.com)
2. Нажмите **"New Project"**
3. Подключите ваш GitHub/GitLab/Bitbucket репозиторий
4. Vercel автоматически определит Next.js проект
5. Настройки сборки (обычно не требуют изменений):
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

#### 3. Настройка переменных окружения

В настройках проекта → **Environment Variables** добавьте:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com
```

**Важно:** 
- Переменные с префиксом `NEXT_PUBLIC_` доступны в браузере
- После добавления переменных нужно пересобрать проект

#### 4. Деплой через Vercel CLI (альтернатива)

```bash
# Установка Vercel CLI
npm install -g vercel

# Вход в аккаунт
vercel login

# Деплой (первый раз)
vercel

# Production деплой
vercel --prod
```

#### 5. Настройка домена (опционально)

1. В настройках проекта → **Domains**
2. Добавьте свой домен
3. Следуйте инструкциям для настройки DNS

---

## 🌐 Вариант 2: Netlify

### Преимущества:
- ✅ Бесплатный тариф
- ✅ Уже есть конфигурация `netlify.toml`
- ✅ Автоматический деплой из Git
- ✅ SSL сертификаты

### Шаги деплоя:

#### 1. Обновление конфигурации Netlify

Файл `netlify.toml` уже настроен, но нужно обновить для Next.js:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
```

#### 2. Деплой через Netlify Dashboard

1. Зайдите на [netlify.com](https://netlify.com)
2. Нажмите **"Add new site"** → **"Import an existing project"**
3. Подключите ваш Git репозиторий
4. Настройки сборки:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
5. Нажмите **"Deploy site"**

#### 3. Настройка переменных окружения

В настройках сайта → **Site settings** → **Environment variables**:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com
```

#### 4. Деплой через Netlify CLI

```bash
# Установка Netlify CLI
npm install -g netlify-cli

# Вход в аккаунт
netlify login

# Инициализация проекта
netlify init

# Production деплой
netlify deploy --prod
```

---

## 🐳 Вариант 3: Docker на VPS

### Подходит для:
- DigitalOcean Droplet
- AWS EC2
- Hetzner Cloud
- Любой VPS с Docker

### Шаги деплоя:

#### 1. Подготовка VPS

```bash
# Обновление системы (Ubuntu/Debian)
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установка Docker Compose
sudo apt install docker-compose -y

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER
```

#### 2. Клонирование проекта на VPS

```bash
# Установка Git
sudo apt install git -y

# Клонирование репозитория
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

#### 3. Настройка переменных окружения

Создайте файл `.env`:

```env
# Frontend
FRONTEND_PORT=3000
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com

# Backend (если деплоите вместе)
BACKEND_PORT=8000
DB_URL=mysql+pymysql://user:password@host:3306/cardb
SECRET_KEY=your-super-secret-key
```

#### 4. Сборка и запуск

```bash
# Сборка только frontend
docker build -f Dockerfile.frontend -t car-frontend .

# Запуск
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com \
  --name car-frontend \
  car-frontend
```

#### 5. Настройка Nginx (реверс-прокси)

```bash
# Установка Nginx
sudo apt install nginx -y

# Создание конфигурации
sudo nano /etc/nginx/sites-available/car-frontend
```

Конфигурация Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Активация конфигурации
sudo ln -s /etc/nginx/sites-available/car-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 6. Настройка SSL (Let's Encrypt)

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получение сертификата
sudo certbot --nginx -d your-domain.com
```

---

## ⚙️ Настройка Backend для Production

### Важно: Backend должен быть доступен из интернета

#### Варианты хостинга Backend:

1. **AWS Elastic Beanstalk** (см. `README_DEPLOY.md`)
2. **Railway** (railway.app) - простой деплой
3. **Render** (render.com) - бесплатный тариф
4. **DigitalOcean App Platform**
5. **VPS с Docker** (как описано выше)

#### Настройка CORS в Backend

Убедитесь, что в `app/main.py` добавлен URL вашего frontend:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-frontend.vercel.app",  # Vercel
        "https://your-frontend.netlify.app",  # Netlify
        "https://your-domain.com",             # Ваш домен
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔐 Переменные окружения для Production

### Frontend (Next.js):

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com
NODE_ENV=production
```

### Backend (FastAPI):

```env
DB_URL=mysql+pymysql://user:password@host:3306/cardb
SECRET_KEY=your-very-secure-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=https://your-frontend.vercel.app,https://your-frontend.netlify.app
```

---

## 📝 Чеклист перед деплоем

- [ ] Проект успешно собирается локально (`npm run build`)
- [ ] Все тесты проходят
- [ ] Backend API доступен и работает
- [ ] Настроены переменные окружения
- [ ] CORS настроен в Backend для вашего frontend URL
- [ ] SSL сертификаты настроены (для production)
- [ ] Домен настроен (если используется)

---

## 🐛 Решение проблем

### Проблема: Frontend не может подключиться к Backend

**Решение:**
1. Проверьте переменную `NEXT_PUBLIC_API_BASE_URL`
2. Убедитесь, что Backend доступен из интернета
3. Проверьте CORS настройки в Backend
4. Проверьте firewall настройки

### Проблема: Ошибки сборки на Vercel/Netlify

**Решение:**
1. Проверьте логи сборки в Dashboard
2. Убедитесь, что все зависимости в `package.json`
3. Проверьте версию Node.js (должна быть 18+)
4. Убедитесь, что `vitest.config.ts` исключен из сборки

### Проблема: Страницы не работают после деплоя

**Решение:**
1. Проверьте, что используется `getServerSideProps` для страниц с авторизацией
2. Убедитесь, что `router.push` используется только в `useEffect`
3. Проверьте логи в консоли браузера

---

## 📚 Полезные ссылки

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Documentation](https://docs.docker.com/)

---

## 🎯 Рекомендации

1. **Для быстрого деплоя:** Используйте Vercel
2. **Для полного контроля:** Используйте VPS с Docker
3. **Для бесплатного хостинга:** Vercel или Netlify
4. **Для production:** Используйте собственный домен с SSL

---

**Удачи с деплоем! 🚀**

