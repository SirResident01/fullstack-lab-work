# Настройка PostgreSQL на Railway

## Создание переменной DATABASE_URL в Backend-сервисе

Для корректного подключения к PostgreSQL на Railway необходимо создать переменную окружения в вашем Backend-сервисе:

### Шаги:

1. Откройте Railway Dashboard
2. Выберите ваш **Backend Service** (не PostgreSQL, а именно веб-сервис)
3. Перейдите в раздел **Variables**
4. Нажмите **New Variable**
5. Заполните:
   - **KEY**: `DATABASE_URL`
   - **VALUE**: `${{ Postgres.DATABASE_URL }}`
   
   ⚠️ **ВАЖНО**: Используйте именно `${{ Postgres.DATABASE_URL }}` со скобками, без кавычек!

6. Нажмите **Save**
7. Перезапустите сервис (Railway сделает это автоматически при сохранении переменной)

### Альтернативный способ (если первый не работает):

Если переменная `${{ Postgres.DATABASE_URL }}` не работает, можно использовать прямой URL:

1. Откройте ваш PostgreSQL сервис в Railway
2. Перейдите в **Settings** → **Connect**
3. Скопируйте **Connection String**
4. В Backend Service → Variables создайте:
   - **KEY**: `DATABASE_URL`
   - **VALUE**: Скопированный Connection String (например: `postgresql://postgres:password@host:port/railway`)

### Проверка:

После настройки переменной, в логах приложения должно появиться:
```
Database configuration: DATABASE_URL=SET
Database initialized successfully
```

Если видите:
```
Database configuration: DATABASE_URL=NOT SET
```

Значит переменная не установлена или установлена неправильно.

### Примечания:

- Railway автоматически использует внутренний URL (`postgres.railway.internal`), который не требует SSL
- Если используется внешний URL, SSL будет добавлен автоматически
- Приложение продолжит работу даже если подключение к БД не удалось, но с предупреждением
