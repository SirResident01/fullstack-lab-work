import os
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError, MultipleResultsFound, IntegrityError
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
    
    if database_url is None:
        log.error("=" * 80)
        log.error("CRITICAL ERROR: DATABASE_URL is not set!")
        log.error("=" * 80)
        log.error("The application requires DATABASE_URL environment variable to be set.")
        log.error("On Railway:")
        log.error("1. Go to Railway Dashboard → Your Backend Service")
        log.error("2. Variables → New Variable")
        log.error("3. KEY: DATABASE_URL")
        log.error("4. VALUE: ${{ Postgres.DATABASE_URL }}")
        log.error("5. Save and redeploy")
        log.error("=" * 80)
        raise RuntimeError(
            "DATABASE_URL is not set. Configure it in Railway Variables."
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

# Получаем DATABASE_URL - если не установлен, будет RuntimeError
DB_URL = get_db_url()

# Настройки для production (Railway PostgreSQL)
# Подготовка connect_args с поддержкой SSL для облачных PostgreSQL
connect_args = {
    "connect_timeout": 10,
}

# Для PostgreSQL добавляем SSL если не указан в URL
# Railway использует внутренний URL (postgres.railway.internal), который не требует SSL
# Но если используется внешний URL, может потребоваться SSL
if "postgresql" in DB_URL or "postgres" in DB_URL:
    # Проверяем, не указан ли уже sslmode в URL
    if "sslmode" not in DB_URL.lower():
        # Для внешних подключений (не internal) может потребоваться SSL
        # Railway обычно использует внутренний URL (postgres.railway.internal), который не требует SSL
        if "railway.internal" not in DB_URL.lower():
            # Пробуем добавить SSL, но если не получится - продолжаем без него
            try:
                connect_args["sslmode"] = "require"
                log.info("Added SSL mode 'require' for PostgreSQL connection (external URL)")
            except Exception as e:
                log.warning(f"Could not set SSL mode: {e}")
        else:
            log.info("Using internal Railway PostgreSQL URL (SSL not required)")
    else:
        log.info("SSL mode already specified in DATABASE_URL")
elif "mysql" in DB_URL:
    # Для MySQL используем charset
    connect_args["charset"] = "utf8mb4"

# Создаем engine с правильными параметрами
# Используем DATABASE_URL напрямую, без ручной подстановки
engine = create_engine(
    DB_URL,
    echo=os.getenv("DB_ECHO", "False").lower() == "true",
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_recycle=3600,  # Переподключение каждый час
    connect_args=connect_args
)

# Создаем SessionLocal для работы с БД
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def init_db_with_seed() -> None:
    """Create tables if not exist and seed initial data once. Idempotent - safe to call multiple times."""
    try:
        log.info("Initializing database...")
        Base.metadata.create_all(engine)
        log.info("Database tables created/verified")
        
        with SessionLocal() as s:
            # Используем .scalars().first() вместо scalar_one_or_none() для безопасной проверки
            # Это вернет первый результат или None, независимо от количества записей
            stmt = select(Owner)
            result = s.execute(stmt)
            first_owner = result.scalars().first()
            
            # Создаем только демонстрационные данные (автомобили и владельцев)
            # Пользователи создаются только через регистрацию
            if not first_owner:
                log.info("Seeding initial data...")
                
                # Проверяем существование владельцев по имени и фамилии (get-or-create pattern)
                # John Johnson
                stmt_john = select(Owner).where(
                    Owner.firstname == "John",
                    Owner.lastname == "Johnson"
                )
                o1 = s.execute(stmt_john).scalars().first()
                if not o1:
                    o1 = Owner(firstname="John", lastname="Johnson")
                    s.add(o1)
                    s.flush()  # Получаем ownerid
                    log.info("Created owner: John Johnson")
                else:
                    log.info("Owner John Johnson already exists, skipping")
                
                # Mary Robinson
                stmt_mary = select(Owner).where(
                    Owner.firstname == "Mary",
                    Owner.lastname == "Robinson"
                )
                o2 = s.execute(stmt_mary).scalars().first()
                if not o2:
                    o2 = Owner(firstname="Mary", lastname="Robinson")
                    s.add(o2)
                    s.flush()  # Получаем ownerid
                    log.info("Created owner: Mary Robinson")
                else:
                    log.info("Owner Mary Robinson already exists, skipping")
                
                s.commit()  # Сохраняем владельцев
                
                # Теперь создаем автомобили с проверкой по registrationNumber (уникальное поле)
                # Ford Mustang
                stmt_car1 = select(Car).where(Car.registrationNumber == "ADF-1121")
                car1 = s.execute(stmt_car1).scalars().first()
                if not car1:
                    car1 = Car(
                        brand="Ford",
                        model="Mustang",
                        color="Red",
                        registrationNumber="ADF-1121",
                        modelYear=2023,
                        price=59000,
                        owner_id=o1.ownerid
                    )
                    s.add(car1)
                    log.info("Created car: Ford Mustang (ADF-1121)")
                else:
                    log.info("Car ADF-1121 already exists, skipping")
                
                # Nissan Leaf
                stmt_car2 = select(Car).where(Car.registrationNumber == "SSJ-3002")
                car2 = s.execute(stmt_car2).scalars().first()
                if not car2:
                    car2 = Car(
                        brand="Nissan",
                        model="Leaf",
                        color="White",
                        registrationNumber="SSJ-3002",
                        modelYear=2020,
                        price=29000,
                        owner_id=o2.ownerid
                    )
                    s.add(car2)
                    log.info("Created car: Nissan Leaf (SSJ-3002)")
                else:
                    log.info("Car SSJ-3002 already exists, skipping")
                
                # Toyota Prius
                stmt_car3 = select(Car).where(Car.registrationNumber == "KKO-0212")
                car3 = s.execute(stmt_car3).scalars().first()
                if not car3:
                    car3 = Car(
                        brand="Toyota",
                        model="Prius",
                        color="Silver",
                        registrationNumber="KKO-0212",
                        modelYear=2022,
                        price=39000,
                        owner_id=o2.ownerid
                    )
                    s.add(car3)
                    log.info("Created car: Toyota Prius (KKO-0212)")
                else:
                    log.info("Car KKO-0212 already exists, skipping")
                
                s.commit()
                log.info("Initial data seeded successfully (idempotent)")
            else:
                log.info("Database already has data, skipping seed")
        
        log.info("Database initialized successfully")
    except OperationalError as e:
        log.error("=" * 80)
        log.error("Database unreachable, starting without DB")
        log.error(f"OperationalError: {e}")
        log.error("=" * 80)
        log.error("The application will continue running, but database operations will fail.")
        log.error("Please check:")
        log.error("1. DATABASE_URL is correctly set in Railway Variables")
        log.error("2. PostgreSQL service is running and accessible")
        log.error("3. Network connectivity is available")
        log.error("4. SSL/TLS settings are correct (if using external URL)")
        log.error("=" * 80)
        log.warning("Application running without database")
        # НЕ поднимаем исключение - приложение должно продолжить работу
    except (MultipleResultsFound, IntegrityError) as e:
        log.error("=" * 80)
        log.error("Error during DB seeding; database is reachable but seed data may be inconsistent")
        log.error(f"Error type: {type(e).__name__}")
        log.error(f"Error message: {e}")
        log.error("=" * 80)
        log.warning("Database is reachable, but seeding encountered data consistency issues.")
        log.warning("Application will continue running with existing data.")
        # НЕ поднимаем исключение - приложение может работать с существующими данными
    except Exception as e:
        log.error("=" * 80)
        log.error("Unexpected error during DB init")
        log.error(f"Error type: {type(e).__name__}")
        log.error(f"Error message: {e}")
        import traceback
        log.error(f"Traceback: {traceback.format_exc()}")
        log.error("=" * 80)
        log.warning("Application will continue running, but database initialization may be incomplete.")
        # НЕ поднимаем исключение - приложение должно продолжить работу
