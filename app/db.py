import os
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from .models import Base, Owner, Car, AppUser

# Настройка логирования
log = logging.getLogger(__name__)

# Load .env early so DB_URL is available before engine creation
# ВАЖНО: В production (Railway/Render) переменные окружения имеют приоритет!
# Сначала проверяем, есть ли DATABASE_URL в окружении (production)
database_url_from_env = os.getenv("DATABASE_URL")

# Загружаем config.env ТОЛЬКО если DATABASE_URL не установлен (для локальной разработки)
if not database_url_from_env:
    try:
        load_dotenv("config.env", override=True)
        log.info("Loaded config.env for local development")
    except Exception as e:
        log.warning(f"Could not load config.env: {e}")
else:
    log.info("DATABASE_URL found in environment, skipping config.env (production mode)")

# Перезагружаем переменные окружения с приоритетом (production переменные перезапишут config.env)
# override=True означает, что переменные окружения ПЕРЕЗАПИШУТ значения из config.env
load_dotenv(override=True)

# Логируем все переменные окружения связанные с БД (для отладки)
log.info("=" * 80)
log.info("Checking database environment variables:")
db_env_vars = ["DATABASE_URL", "DB_URL", "DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "RDS_HOSTNAME"]
for var in db_env_vars:
    value = os.getenv(var)
    if value:
        # Маскируем пароли
        if "@" in str(value) or "password" in var.lower():
            try:
                parts = str(value).split("@")
                if len(parts) > 1:
                    masked = parts[0].split(":")[0] + "://***:***@" + "@".join(parts[1:])
                else:
                    masked = "***"
            except:
                masked = "***"
            log.info(f"  {var} = {masked} (SET)")
        else:
            log.info(f"  {var} = {value} (SET)")
    else:
        log.info(f"  {var} = NOT SET")
log.info("=" * 80)

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
    log.info(f"Checking DATABASE_URL: {'SET' if database_url else 'NOT SET'}")
    if database_url:
        # Railway/Render могут использовать postgres:// вместо postgresql://
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql+psycopg://", 1)
        # Маскируем пароль для логирования
        masked = database_url.split("@")[0].split(":")[0] + "://***:***@" + "@".join(database_url.split("@")[1:]) if "@" in database_url else "***"
        log.info(f"Using DATABASE_URL: {masked}")
        return database_url
    
    # Приоритет 2: DB_URL (полный URL подключения)
    db_url = os.getenv("DB_URL")
    log.info(f"Checking DB_URL: {'SET' if db_url else 'NOT SET'}")
    if db_url:
        masked = db_url.split("@")[0].split(":")[0] + "://***:***@" + "@".join(db_url.split("@")[1:]) if "@" in db_url else "***"
        log.info(f"Using DB_URL: {masked}")
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
    
    # ВНИМАНИЕ: Использование localhost по умолчанию - это проблема для production!
    # Если мы дошли сюда, значит DATABASE_URL и DB_URL не установлены
    log.error("=" * 80)
    log.error("CRITICAL: DATABASE_URL and DB_URL are not set!")
    log.error("Available environment variables:")
    for key in ["DATABASE_URL", "DB_URL", "DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "RDS_HOSTNAME"]:
        value = os.getenv(key)
        if value:
            # Маскируем пароли
            if "password" in key.lower() or "@" in str(value):
                masked = str(value).split("@")[0].split(":")[0] + "://***:***@" + "@".join(str(value).split("@")[1:]) if "@" in str(value) else "***"
                log.error(f"  {key} = {masked}")
            else:
                log.error(f"  {key} = {value}")
        else:
            log.error(f"  {key} = NOT SET")
    log.error("=" * 80)
    log.error(f"Falling back to default: {db_type}://{db_user}:***@{db_host}:{db_port}/{db_name}")
    log.error("This will NOT work in production! Please set DATABASE_URL or DB_URL environment variable.")
    log.error("=" * 80)
    
    if db_type == "mysql":
        return f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    else:
        return f"postgresql+psycopg://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

DB_URL = get_db_url()

# Логируем информацию о подключении (без пароля)
if DB_URL:
    # Маскируем пароль в URL для безопасности
    masked_url = DB_URL.split("@")[0].split(":")[0] + "://***:***@" + "@".join(DB_URL.split("@")[1:]) if "@" in DB_URL else "***"
    log.info(f"Database URL: {masked_url}")
else:
    log.warning("No database URL found! Using default localhost connection.")

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
    except Exception as e:
        log.error(f"Error initializing database: {e}")
        # Не падаем при ошибке инициализации, чтобы приложение могло запуститься
        # и показать более понятную ошибку
        raise

