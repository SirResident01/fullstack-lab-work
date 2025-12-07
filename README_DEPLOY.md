# Инструкции по деплою

## 📋 Содержание

1. [Лабораторная работа 14 - Security](#лабораторная-работа-14)
2. [Лабораторная работа 15 - Деплой](#лабораторная-работа-15)
   - [Docker контейнеры](#docker-контейнеры)
   - [Netlify (Frontend)](#netlify-frontend)
   - [AWS Elastic Beanstalk (Backend)](#aws-elastic-beanstalk-backend)
   - [AWS RDS (База данных)](#aws-rds-база-данных)

---

## ✅ Лабораторная работа 14 - Security

### Выполненные задачи:

1. **✔ JWT в sessionStorage**
   - Токен теперь хранится в `sessionStorage` вместо `localStorage`
   - Файл: `contexts/AuthContext.tsx`

2. **✔ Snackbar для ошибок**
   - Создан компонент `NotificationContext` с использованием MUI Snackbar
   - Все `alert()` заменены на `useNotification()` hook
   - Файлы:
     - `contexts/NotificationContext.tsx`
     - `pages/_app.tsx` (добавлен NotificationProvider)
     - `components/auth/LoginForm.tsx`
     - `pages/admin/users/index.tsx`
     - `pages/owners/index.tsx`
     - `pages/admin/settings/index.tsx`

---

## 🚀 Лабораторная работа 15 - Деплой

### Docker контейнеры

#### Запуск локально:

```bash
# Запуск всех сервисов (MariaDB + Backend + Frontend)
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Остановка с удалением volumes
docker-compose down -v
```

#### Переменные окружения:

Создайте файл `.env` в корне проекта:

```env
# База данных
DB_ROOT_PASSWORD=rootpassword
DB_NAME=cardb
DB_USER=postgres
DB_PASSWORD=postgres
DB_PORT=3306

# Backend
BACKEND_PORT=8000
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Frontend
FRONTEND_PORT=3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

#### Отдельная сборка образов:

```bash
# Backend
docker build -f Dockerfile.backend -t car-backend .

# Frontend
docker build -f Dockerfile.frontend -t car-frontend .
```

---

### Netlify (Frontend)

#### Шаги деплоя:

1. **Подготовка:**
   - Убедитесь, что `netlify.toml` находится в корне проекта
   - Проверьте, что `next.config.js` содержит `output: 'standalone'`

2. **Деплой через Netlify Dashboard:**
   - Зайдите на [netlify.com](https://netlify.com)
   - Нажмите "New site from Git"
   - Подключите ваш репозиторий
   - Настройки сборки:
     - **Build command:** `npm run build`
     - **Publish directory:** `.next`
   - Добавьте переменные окружения:
     - `NEXT_PUBLIC_API_BASE_URL` - URL вашего backend API

3. **Деплой через Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify init
   netlify deploy --prod
   ```

4. **Переменные окружения в Netlify:**
   - Site settings → Environment variables
   - Добавьте:
     - `NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.elasticbeanstalk.com`

---

### AWS Elastic Beanstalk (Backend)

#### Предварительные требования:

1. Установите [EB CLI](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html)
2. Настройте AWS credentials

#### Шаги деплоя:

1. **Инициализация EB:**
   ```bash
   eb init -p python-3.11 car-management-api
   ```

2. **Создание окружения:**
   ```bash
   eb create car-api-env
   ```

3. **Настройка переменных окружения:**
   ```bash
   eb setenv DB_URL=mysql+pymysql://user:password@rds-endpoint:3306/cardb
   eb setenv SECRET_KEY=your-super-secret-key
   eb setenv ALGORITHM=HS256
   eb setenv ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ```

   Или через AWS Console:
   - Elastic Beanstalk → Your Environment → Configuration → Software → Environment properties

4. **Деплой:**
   ```bash
   eb deploy
   ```

5. **Проверка статуса:**
   ```bash
   eb status
   eb health
   ```

6. **Просмотр логов:**
   ```bash
   eb logs
   ```

#### Конфигурационные файлы:

- `.ebextensions/python.config` - настройки Python окружения
- `.ebextensions/01_python_packages.config` - установка зависимостей
- `Procfile` - команда запуска приложения

---

### AWS RDS (База данных)

#### Создание RDS инстанса:

1. **Через AWS Console:**
   - Перейдите в RDS → Databases → Create database
   - Выберите:
     - **Engine:** MariaDB или MySQL
     - **Template:** Free tier (для тестирования)
     - **DB instance identifier:** `car-management-db`
     - **Master username:** `admin`
     - **Master password:** (создайте надежный пароль)
     - **DB instance class:** `db.t3.micro` (free tier)
     - **Storage:** 20 GB
     - **VPC:** Выберите ту же VPC, что и для Elastic Beanstalk
     - **Public access:** No (рекомендуется)
     - **Security group:** Создайте новую или используйте существующую

2. **Настройка Security Group:**
   - Добавьте правило для входящего трафика:
     - **Type:** MySQL/Aurora
     - **Port:** 3306
     - **Source:** Security group вашего Elastic Beanstalk окружения

3. **Получение endpoint:**
   - После создания, скопируйте **Endpoint** из RDS Console
   - Формат: `your-db-instance.xxxxx.us-east-1.rds.amazonaws.com`

#### Подключение к RDS:

Обновите переменные окружения в Elastic Beanstalk:

```bash
eb setenv \
  RDS_HOSTNAME=your-db-instance.xxxxx.us-east-1.rds.amazonaws.com \
  RDS_PORT=3306 \
  RDS_DB_NAME=cardb \
  RDS_USERNAME=admin \
  RDS_PASSWORD=your-password
```

Или используйте полный DB_URL:

```bash
eb setenv DB_URL=mysql+pymysql://admin:password@your-db-instance.xxxxx.us-east-1.rds.amazonaws.com:3306/cardb
```

#### Инициализация базы данных:

База данных будет автоматически инициализирована при первом запуске приложения благодаря функции `init_db_with_seed()` в `app/db.py`.

---

## 🔧 Поддержка различных типов БД

Приложение поддерживает подключение к различным типам баз данных:

### PostgreSQL:
```env
DB_URL=postgresql+psycopg://user:password@host:5432/cardb
```

### MySQL/MariaDB:
```env
DB_URL=mysql+pymysql://user:password@host:3306/cardb
```

### AWS RDS (автоматическое определение):
```env
RDS_HOSTNAME=your-db-instance.xxxxx.us-east-1.rds.amazonaws.com
RDS_PORT=3306
RDS_DB_NAME=cardb
RDS_USERNAME=admin
RDS_PASSWORD=password
```

### SQLite (для разработки):
```env
DB_URL=sqlite:///./cardb.db
```

---

## 📝 Примечания

1. **Безопасность:**
   - Никогда не коммитьте файлы с паролями и секретными ключами
   - Используйте переменные окружения для всех чувствительных данных
   - Для production используйте сильные секретные ключи

2. **CORS:**
   - Убедитесь, что в `app/main.py` добавлен URL вашего frontend в `allow_origins`
   - Для Netlify: добавьте URL вида `https://your-site.netlify.app`

3. **Мониторинг:**
   - Используйте CloudWatch для мониторинга AWS сервисов
   - Настройте алерты для критических метрик

4. **Резервное копирование:**
   - Настройте автоматические снапшоты RDS
   - Регулярно делайте бэкапы базы данных

---

## 🐛 Troubleshooting

### Проблемы с подключением к БД:

1. Проверьте Security Groups в AWS
2. Убедитесь, что RDS и EB находятся в одной VPC
3. Проверьте правильность endpoint и credentials

### Проблемы с CORS:

1. Обновите `allow_origins` в `app/main.py`
2. Перезапустите приложение после изменений

### Проблемы с Docker:

1. Убедитесь, что порты не заняты
2. Проверьте логи: `docker-compose logs`
3. Убедитесь, что все переменные окружения установлены

---

## 📚 Дополнительные ресурсы

- [Netlify Documentation](https://docs.netlify.com/)
- [AWS Elastic Beanstalk Documentation](https://docs.aws.amazon.com/elasticbeanstalk/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [Docker Documentation](https://docs.docker.com/)



