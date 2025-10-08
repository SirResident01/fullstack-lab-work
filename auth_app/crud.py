from sqlalchemy.orm import Session
from passlib.context import CryptContext
from .models import AppUser, Car
from .schemas import UserCreate, CarCreate
from .auth import hash_password

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# User CRUD operations
def get_user_by_username(db: Session, username: str) -> AppUser:
    """Get user by username"""
    return db.query(AppUser).filter(AppUser.username == username).first()

def create_user(db: Session, user: UserCreate) -> AppUser:
    """Create new user"""
    hashed_password = hash_password(user.password)
    db_user = AppUser(
        username=user.username,
        password_hash=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str) -> AppUser:
    """Authenticate user with username and password"""
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not pwd_context.verify(password, user.password_hash):
        return False
    return user

# Car CRUD operations
def get_cars(db: Session, skip: int = 0, limit: int = 100):
    """Get all cars with pagination"""
    return db.query(Car).offset(skip).limit(limit).all()

def get_car_by_id(db: Session, car_id: int) -> Car:
    """Get car by ID"""
    return db.query(Car).filter(Car.id == car_id).first()

def create_car(db: Session, car: CarCreate) -> Car:
    """Create new car"""
    db_car = Car(**car.dict())
    db.add(db_car)
    db.commit()
    db.refresh(db_car)
    return db_car

def update_car(db: Session, car_id: int, car_data: CarCreate) -> Car:
    """Update car"""
    db_car = get_car_by_id(db, car_id)
    if db_car:
        for key, value in car_data.dict().items():
            setattr(db_car, key, value)
        db.commit()
        db.refresh(db_car)
    return db_car

def delete_car(db: Session, car_id: int) -> bool:
    """Delete car"""
    db_car = get_car_by_id(db, car_id)
    if db_car:
        db.delete(db_car)
        db.commit()
        return True
    return False

