import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base, Owner, Car, AppUser

# Load .env early so DB_URL is available before engine creation
load_dotenv("config.env")

# Поддержка различных типов БД:
# - PostgreSQL: postgresql+psycopg://user:password@host:port/dbname
# - MySQL/MariaDB: mysql+pymysql://user:password@host:port/dbname
# - AWS RDS: mysql+pymysql://user:password@rds-endpoint:3306/dbname
# - SQLite: sqlite:///./cardb.db (для разработки)

# Приоритет переменных окружения для AWS RDS:
# 1. DB_URL (полный URL подключения)
# 2. RDS_HOSTNAME, RDS_PORT, RDS_DB_NAME, RDS_USERNAME, RDS_PASSWORD (для AWS RDS)
# 3. DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD (общие переменные)
# 4. Значение по умолчанию

def get_db_url():
    """Получить URL подключения к БД с поддержкой AWS RDS и Railway/Render"""
    # Приоритет 1: DATABASE_URL (стандарт для Railway, Render, Heroku)
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        # Railway/Render могут использовать postgres:// вместо postgresql://
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql+psycopg://", 1)
        return database_url
    
    # Приоритет 2: DB_URL (полный URL подключения)
    db_url = os.getenv("DB_URL")
    if db_url:
        return db_url
    
    # Проверяем переменные AWS RDS
    rds_hostname = os.getenv("RDS_HOSTNAME")
    if rds_hostname:
        rds_port = os.getenv("RDS_PORT", "3306")
        rds_db_name = os.getenv("RDS_DB_NAME", "cardb")
        rds_username = os.getenv("RDS_USERNAME", "admin")
        rds_password = os.getenv("RDS_PASSWORD", "")
        # AWS RDS обычно использует MySQL/MariaDB
        return f"mysql+pymysql://{rds_username}:{rds_password}@{rds_hostname}:{rds_port}/{rds_db_name}"
    
    # Проверяем общие переменные окружения
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5432")
    db_name = os.getenv("DB_NAME", "cardb")
    db_user = os.getenv("DB_USER", "postgres")
    db_password = os.getenv("DB_PASSWORD", "postgres")
    db_type = os.getenv("DB_TYPE", "postgresql")  # postgresql или mysql
    
    if db_type == "mysql":
        return f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    else:
        return f"postgresql+psycopg://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

DB_URL = get_db_url()

# Настройки для production (AWS RDS)
engine = create_engine(
    DB_URL,
    echo=os.getenv("DB_ECHO", "False").lower() == "true",
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_recycle=3600,  # Переподключение каждый час
    connect_args={
        "connect_timeout": 10,
        "charset": "utf8mb4" if "mysql" in DB_URL else None
    }
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def init_db_with_seed() -> None:
    """Create tables if not exist and seed initial data once."""
    Base.metadata.create_all(engine)
    with SessionLocal() as s:
        # Создаем только демонстрационные данные (автомобили и владельцев)
        # Пользователи создаются только через регистрацию
        if not s.query(Owner).first():
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

