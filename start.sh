#!/bin/sh

# Railway автоматически устанавливает переменную PORT
# Используем её или 8000 по умолчанию
if [ -z "$PORT" ]; then
  PORT=8000
fi

echo "=========================================="
echo "Starting application on port $PORT"
echo "DATABASE_URL: ${DATABASE_URL:+SET}"
echo "DB_URL: ${DB_URL:+SET}"
echo "PORT: $PORT"
echo "=========================================="

# Запускаем uvicorn
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --log-level info

