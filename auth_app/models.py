from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.orm import relationship
from .database import Base

class AppUser(Base):
    __tablename__ = "app_users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="USER")  # USER or ADMIN

class Car(Base):
    __tablename__ = "cars"
    
    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    color = Column(String(50), nullable=False)
    year = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

