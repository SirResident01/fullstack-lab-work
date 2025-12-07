#!/usr/bin/env python3
"""
Скрипт для создания таблиц базы данных через SQLAlchemy
Использование: python create_tables.py
"""

import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

# Добавляем путь к app
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.models import Base
from app.db import get_db_url, engine, log

def create_tables():
    """Создает все таблицы в базе данных"""
    try:
        log.info("=" * 80)
        log.info("Creating database tables...")
        log.info("=" * 80)
        
        # Создаем все таблицы
        Base.metadata.create_all(engine)
        
        log.info("✅ All tables created successfully!")
        log.info("=" * 80)
        log.info("Created tables:")
        log.info("  - app_users (пользователи системы)")
        log.info("  - owner (владельцы автомобилей)")
        log.info("  - car (автомобили)")
        log.info("=" * 80)
        
        # Проверяем созданные таблицы
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                  AND table_type = 'BASE TABLE'
                ORDER BY table_name
            """))
            tables = [row[0] for row in result]
            log.info(f"Tables in database: {', '.join(tables)}")
        
        return True
        
    except OperationalError as e:
        log.error("=" * 80)
        log.error("❌ Database connection error!")
        log.error(f"Error: {e}")
        log.error("=" * 80)
        log.error("Please check:")
        log.error("1. DATABASE_URL is correctly set")
        log.error("2. Database server is accessible")
        log.error("3. Network connectivity is available")
        log.error("4. SSL/TLS settings are correct (for Supabase)")
        log.error("=" * 80)
        return False
    except Exception as e:
        log.error(f"❌ Error creating tables: {e}")
        import traceback
        log.error(f"Traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    # Загружаем переменные окружения
    load_dotenv("config.env", override=False)
    load_dotenv(override=True)
    
    success = create_tables()
    sys.exit(0 if success else 1)

