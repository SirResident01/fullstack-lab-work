import os
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
from .models import Base, Owner, Car, AppUser

# Настройка логирования
log = logging.getLogger(__name__)

# В production (Railway/Render) используем ТОЛЬКО переменные окружения
# Проверяем, не в production ли мы
is_production = os.getenv("PORT") or os.getenv("RAILWAY_ENVIRONMENT") or os.getenv("RENDER")

# Загружаем config.env ТОЛЬКО для локальной разработки (если DATABASE_URL не установлен и не production)
database_url_from_env = os.getenv("DATABASE_URL")
if not database_url_from_env and not is_production:
    try:
        load_dotenv("config.env", override=True)
        log.info("Loaded config.env for local development")
    except Exception as e:
        log.warning(f"Could not load config.env: {e}")

# Перезагружаем переменные окружения с приоритетом
load_dotenv(override=True)

# Логируем статус DATABASE_URL (без полного URL для безопасности)
database_url_status = "SET" if os.getenv("DATABASE_URL") else "NOT SET"
log.info("=" * 80)
log.info(f"Database configuration: DATABASE_URL={database_url_status}")
log.info("=" * 80)

def get_db_url():
    """Получить URL подключения к БД ТОЛЬКО из DATABASE_URL"""
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        log.error("=" * 80)
        log.error("CRITICAL ERROR: DATABASE_URL is not set!")
        log.error("=" * 80)
        log.error("The application requires DATABASE_URL environment variable to be set.")
        log.error("On Railway:")
        log.error("1. Go to Railway Dashboard → Your PostgreSQL Database")
        log.error("2. Settings → Connect → Select your Web Service")
        log.error("3. Railway will automatically create DATABASE_URL variable")
        log.error("4. Or add it manually in your service Variables")
        log.error("=" * 80)
        raise RuntimeError(
            "DATABASE_URL is not set. Please configure it in the environment (Railway variables)."
        )
    
    # Railway/Render могут использовать postgres:// вместо postgresql://
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql+psycopg://", 1)
    # Также проверяем postgresql:// без psycopg
    elif database_url.startswith("postgresql://") and "+psycopg" not in database_url:
        database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    
    # Маскируем пароль для логирования
    masked = database_url.split("@")[0].split(":")[0] + "://***:***@" + "@".join(database_url.split("@")[1:]) if "@" in database_url else "***"
    log.info(f"Using DATABASE_URL: {masked}")
    
    return database_url

DB_URL = get_db_url()

# Настройки для production (Railway PostgreSQL)
# Подготовка connect_args с поддержкой SSL для облачных PostgreSQL
connect_args = {
    "connect_timeout": 10,
}

# Для PostgreSQL добавляем SSL если не указан в URL
if "postgresql" in DB_URL or "postgres" in DB_URL:
    # Проверяем, не указан ли уже sslmode в URL
    if "sslmode" not in DB_URL.lower():
        # Для облачных PostgreSQL (Railway, Render, Supabase) требуется SSL
        connect_args["sslmode"] = "require"
        log.info("Added SSL mode 'require' for PostgreSQL connection")
    else:
        log.info("SSL mode already specified in DATABASE_URL")
elif "mysql" in DB_URL:
    # Для MySQL используем charset
    connect_args["charset"] = "utf8mb4"

engine = create_engine(
    DB_URL,
    echo=os.getenv("DB_ECHO", "False").lower() == "true",
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_recycle=3600,  # Переподключение каждый час
    connect_args=connect_args
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def init_db_with_seed() -> None:
    """Create tables if not exist and seed initial data once."""
    try:
        log.info("Initializing database...")
        Base.metadata.create_all(engine)
        log.info("Database tables created/verified")
        
        with SessionLocal() as s:
            # Используем новый синтаксис SQLAlchemy 2.0
            stmt = select(Owner)
            result = s.execute(stmt)
            first_owner = result.scalar_one_or_none()
            
            # Создаем только демонстрационные данные (автомобили и владельцев)
            # Пользователи создаются только через регистрацию
            if not first_owner:
                log.info("Seeding initial data...")
                o1 = Owner(firstname="John", lastname="Johnson")
                o2 = Owner(firstname="Mary", lastname="Robinson")
                s.add_all([o1, o2])
                s.commit()  # Сохраняем владельцев сначала
                
                # Теперь создаем автомобили с правильными owner_id
                s.add_all([
                    Car(brand="Ford",   model="Mustang", color="Red",    registrationNumber="ADF-1121", modelYear=2023, price=59000, owner_id=o1.ownerid),
                    Car(brand="Nissan", model="Leaf",    color="White",  registrationNumber="SSJ-3002", modelYear=2020, price=29000, owner_id=o2.ownerid),
                    Car(brand="Toyota", model="Prius",   color="Silver", registrationNumber="KKO-0212", modelYear=2022, price=39000, owner_id=o2.ownerid),
                ])
                s.commit()
                log.info("Initial data seeded successfully")
            else:
                log.info("Database already has data, skipping seed")
    except OperationalError as e:
        log.error("=" * 80)
        log.error("Database unreachable, starting app without DB.")
        log.error(f"OperationalError: {e}")
        log.error("=" * 80)
        log.error("The application will continue running, but database operations will fail.")
        log.error("Please check:")
        log.error("1. DATABASE_URL is correctly set")
        log.error("2. Database server is accessible")
        log.error("3. Network connectivity is available")
        log.error("4. SSL/TLS settings are correct")
        log.error("=" * 80)
        # НЕ поднимаем исключение - приложение должно продолжить работу
    except Exception as e:
        log.error(f"Error initializing database: {e}")
        import traceback
        log.error(f"Traceback: {traceback.format_exc()}")
        # Для других ошибок тоже не падаем, но логируем детально
        log.error("Database initialization failed, but application will continue running.")

