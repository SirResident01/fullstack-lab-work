# 🔧 Настройка Supabase PostgreSQL на Railway

## ✅ Что уже сделано:

1. ✅ Обновлен `config.env` с URL Supabase
2. ✅ Добавлена поддержка формата `postgresql://` (автоматическая конвертация)
3. ✅ Код готов к работе с Supabase

## 🚀 Что нужно сделать на Railway:

### Шаг 1: Добавить переменную DATABASE_URL

1. Откройте ваш **Web Service** в Railway Dashboard
2. Перейдите в **"Variables"**
3. Нажмите **"+ New Variable"**
4. Добавьте:
   - **Key:** `DATABASE_URL`
   - **Value:** `postgresql://postgres:asia13579@db.beremjwiwihcfvvqngzd.supabase.co:5432/postgres`

### Шаг 2: Проверить другие переменные

Убедитесь, что также установлены:

```
SECRET_KEY=your-very-secure-secret-key-min-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=https://fullstack-lab-work.vercel.app,https://fullstack-lab-work-oajjvn4s2-llls-projects-d13c13b6.vercel.app
```

### Шаг 3: Перезапустить сервис

После добавления переменных Railway автоматически перезапустит сервис.

## ✅ Проверка:

После перезапуска проверьте логи - должны увидеть:
```
Using DATABASE_URL: postgresql+psycopg://***:***@db.beremjwiwihcfvvqngzd.supabase.co:5432/postgres
Database tables created/verified
Application started successfully
```

## 📝 Важно:

- URL Supabase: `postgresql://postgres:asia13579@db.beremjwiwihcfvvqngzd.supabase.co:5432/postgres`
- Код автоматически конвертирует `postgresql://` в `postgresql+psycopg://` для SQLAlchemy
- В production используется переменная `DATABASE_URL` (не config.env)


