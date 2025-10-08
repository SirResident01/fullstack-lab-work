import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base, Owner, Car, AppUser

# Load .env early so DB_URL is available before engine creation
load_dotenv("config.env")
DB_URL = os.getenv("DB_URL", "postgresql+psycopg://postgres:postgres@localhost:5432/cardb")

engine = create_engine(DB_URL, echo=True, pool_pre_ping=True)
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

