import logging
import os
import time
from typing import List, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func
import jwt
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext
from .db import SessionLocal, init_db_with_seed
from .schemas import (
    CarCreate, CarUpdate, CarResponse, CarWithOwner, CarQuery,
    OwnerCreate, OwnerUpdate, OwnerResponse, OwnerQuery,
    StatusResponse, MessageResponse, UserLogin, UserRegister, Token, UserResponse
)
from .crud import CarCRUD, OwnerCRUD
from .models import AppUser, Car, Owner

# Load config
load_dotenv("config.env")
APP_NAME = os.getenv("APP_NAME", "Lab1 FastAPI")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# Password hashing - используем pbkdf2_sha256 для поддержки любых символов
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# Security scheme
security = HTTPBearer()

# Logging
logging.basicConfig(level=logging.DEBUG, format="%(levelname)s %(name)s: %(message)s")
log = logging.getLogger("lab1")

app = FastAPI(title=APP_NAME, version=APP_VERSION)

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication functions
def hash_password(password: str) -> str:
    """Hash password using pbkdf2_sha256 - поддерживает любые символы и длину"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash - поддерживает любые символы и длину"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> AppUser:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except InvalidTokenError:
        raise credentials_exception
    
    user = db.query(AppUser).filter(AppUser.username == username).first()
    if user is None:
        raise credentials_exception
    return user

def role_required(required_role: str):
    """Dependency to check user role"""
    def role_checker(current_user: AppUser = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker

@app.on_event("startup")
async def on_startup():
    init_db_with_seed()
    log.info("🚀 Application started")

# ==================== BASIC ENDPOINTS ====================

@app.get("/")
def root():
    """Root endpoint"""
    return {"message": "Car Management API", "status": "running", "version": APP_VERSION}

@app.get("/hello")
def hello():
    return "Hello from FastAPI!"

@app.get("/api/status", response_model=StatusResponse)
def status():
    log.debug("Status requested")
    return StatusResponse(
        status="ok", 
        app=APP_NAME, 
        version=APP_VERSION,
        timestamp=datetime.now()
    )

# ==================== AUTHENTICATION ENDPOINTS ====================

@app.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Login endpoint - returns JWT token"""
    user = db.query(AppUser).filter(AppUser.username == user_credentials.username).first()
    if not user or not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/register", response_model=UserResponse)
def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register new regular user"""
    # Проверяем, что пароли совпадают
    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Пароли не совпадают"
        )
    
    # Проверяем, что пользователь с таким именем не существует
    existing_user = db.query(AppUser).filter(AppUser.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Пользователь с таким именем уже существует"
        )
    
    # Создаем нового пользователя
    hashed_password = hash_password(user_data.password)
    new_user = AppUser(
        username=user_data.username,
        password_hash=hashed_password,
        role="USER"  # Обычный пользователь
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@app.post("/register/admin", response_model=UserResponse)
def register_admin(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register new admin user"""
    # Проверяем, что пароли совпадают
    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Пароли не совпадают"
        )
    
    # Проверяем, что пользователь с таким именем не существует
    existing_user = db.query(AppUser).filter(AppUser.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Пользователь с таким именем уже существует"
        )
    
    # Создаем нового админа
    hashed_password = hash_password(user_data.password)
    new_user = AppUser(
        username=user_data.username,
        password_hash=hashed_password,
        role="ADMIN"  # Администратор
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@app.get("/users/me", response_model=UserResponse)
def read_users_me(current_user: AppUser = Depends(get_current_user)):
    """Get current user information"""
    return current_user

# ==================== CAR ENDPOINTS ====================

@app.get("/cars", response_model=List[CarWithOwner])
def get_cars(
    skip: int = Query(0, ge=0, description="Количество записей для пропуска"),
    limit: int = Query(100, ge=1, le=1000, description="Максимальное количество записей"),
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(get_current_user)
):
    """Получить все автомобили с пагинацией"""
    log.debug(f"Getting cars: skip={skip}, limit={limit}")
    cars = CarCRUD.get_all(db, skip=skip, limit=limit)
    return [
        CarWithOwner(
            id=car.id,
            brand=car.brand,
            model=car.model,
            color=car.color,
            registrationNumber=car.registrationNumber,
            modelYear=car.modelYear,
            price=car.price,
            owner_id=car.owner_id,
            owner=f"{car.owner.firstname} {car.owner.lastname}" if car.owner else None,
            owner_firstname=car.owner.firstname if car.owner else None,
            owner_lastname=car.owner.lastname if car.owner else None
        )
        for car in cars
    ]

@app.get("/cars/statistics")
def get_car_statistics(db: Session = Depends(get_db)):
    """Получить статистику по автомобилям"""
    log.debug("Getting car statistics")
    return CarCRUD.get_statistics(db)

@app.get("/cars/{car_id}", response_model=CarWithOwner)
def get_car(car_id: int, db: Session = Depends(get_db)):
    """Получить автомобиль по ID"""
    log.debug(f"Getting car with ID: {car_id}")
    car = CarCRUD.get_by_id(db, car_id)
    if not car:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")
    
    return CarWithOwner(
        id=car.id,
        brand=car.brand,
        model=car.model,
        color=car.color,
        registrationNumber=car.registrationNumber,
        modelYear=car.modelYear,
        price=car.price,
        owner_id=car.owner_id,
        owner=f"{car.owner.firstname} {car.owner.lastname}" if car.owner else None,
        owner_firstname=car.owner.firstname if car.owner else None,
        owner_lastname=car.owner.lastname if car.owner else None
    )

@app.post("/cars", response_model=CarResponse)
def create_car(car: CarCreate, db: Session = Depends(get_db), current_user: AppUser = Depends(role_required("ADMIN"))):
    """Создать новый автомобиль"""
    log.debug(f"Creating car: {car.brand} {car.model}")
    try:
        db_car = CarCRUD.create(db, car)
        # Загружаем владельца
        db.refresh(db_car)
        db_car = CarCRUD.get_by_id(db, db_car.id)
        return CarResponse.model_validate(db_car)
    except Exception as e:
        log.error(f"Error creating car: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Ошибка создания автомобиля: {str(e)}")

@app.put("/cars/{car_id}", response_model=CarResponse)
def update_car(car_id: int, car_update: CarUpdate, db: Session = Depends(get_db), current_user: AppUser = Depends(role_required("ADMIN"))):
    """Обновить автомобиль"""
    log.debug(f"Updating car with ID: {car_id}")
    car = CarCRUD.update(db, car_id, car_update)
    if not car:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")
    # Загружаем владельца
    car = CarCRUD.get_by_id(db, car_id)
    return CarResponse.model_validate(car)

@app.delete("/cars/{car_id}", response_model=MessageResponse)
def delete_car(car_id: int, db: Session = Depends(get_db), current_user: AppUser = Depends(role_required("ADMIN"))):
    """Удалить автомобиль"""
    log.debug(f"Deleting car with ID: {car_id}")
    success = CarCRUD.delete(db, car_id)
    if not success:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")
    return MessageResponse(message="Автомобиль успешно удален")

# ==================== ADVANCED CAR QUERIES ====================

@app.get("/cars/search/brand/{brand}", response_model=List[CarWithOwner])
def find_cars_by_brand(brand: str, db: Session = Depends(get_db)):
    """Найти автомобили по марке"""
    log.debug(f"Searching cars by brand: {brand}")
    cars = CarCRUD.find_by_brand(db, brand)
    return [
        CarWithOwner(
            id=car.id, brand=car.brand, model=car.model, color=car.color,
            registrationNumber=car.registrationNumber, modelYear=car.modelYear,
            price=car.price, owner_id=car.owner_id,
            owner=f"{car.owner.firstname} {car.owner.lastname}" if car.owner else None,
            owner_firstname=car.owner.firstname if car.owner else None,
            owner_lastname=car.owner.lastname if car.owner else None
        )
        for car in cars
    ]

@app.get("/cars/search/color/{color}", response_model=List[CarWithOwner])
def find_cars_by_color(color: str, db: Session = Depends(get_db)):
    """Найти автомобили по цвету"""
    log.debug(f"Searching cars by color: {color}")
    cars = CarCRUD.find_by_color(db, color)
    return [
        CarWithOwner(
            id=car.id, brand=car.brand, model=car.model, color=car.color,
            registrationNumber=car.registrationNumber, modelYear=car.modelYear,
            price=car.price, owner_id=car.owner_id,
            owner=f"{car.owner.firstname} {car.owner.lastname}" if car.owner else None,
            owner_firstname=car.owner.firstname if car.owner else None,
            owner_lastname=car.owner.lastname if car.owner else None
        )
        for car in cars
    ]

@app.get("/cars/search/year/{year}", response_model=List[CarWithOwner])
def find_cars_by_year(year: int, db: Session = Depends(get_db)):
    """Найти автомобили по году выпуска"""
    log.debug(f"Searching cars by year: {year}")
    cars = CarCRUD.find_by_model_year(db, year)
    return [
        CarWithOwner(
            id=car.id, brand=car.brand, model=car.model, color=car.color,
            registrationNumber=car.registrationNumber, modelYear=car.modelYear,
            price=car.price, owner_id=car.owner_id,
            owner=f"{car.owner.firstname} {car.owner.lastname}" if car.owner else None,
            owner_firstname=car.owner.firstname if car.owner else None,
            owner_lastname=car.owner.lastname if car.owner else None
        )
        for car in cars
    ]

@app.get("/cars/search/price-range", response_model=List[CarWithOwner])
def find_cars_by_price_range(
    min_price: int = Query(..., ge=0, description="Минимальная цена"),
    max_price: int = Query(..., ge=0, description="Максимальная цена"),
    db: Session = Depends(get_db)
):
    """Найти автомобили в диапазоне цен"""
    log.debug(f"Searching cars by price range: {min_price}-{max_price}")
    cars = CarCRUD.find_by_price_range(db, min_price, max_price)
    return [
        CarWithOwner(
            id=car.id, brand=car.brand, model=car.model, color=car.color,
            registrationNumber=car.registrationNumber, modelYear=car.modelYear,
            price=car.price, owner_id=car.owner_id,
            owner=f"{car.owner.firstname} {car.owner.lastname}" if car.owner else None,
            owner_firstname=car.owner.firstname if car.owner else None,
            owner_lastname=car.owner.lastname if car.owner else None
        )
        for car in cars
    ]

@app.get("/cars/search/owner/{owner_id}", response_model=List[CarWithOwner])
def find_cars_by_owner(owner_id: int, db: Session = Depends(get_db)):
    """Найти автомобили по владельцу"""
    log.debug(f"Searching cars by owner ID: {owner_id}")
    cars = CarCRUD.find_by_owner(db, owner_id)
    return [
        CarWithOwner(
            id=car.id, brand=car.brand, model=car.model, color=car.color,
            registrationNumber=car.registrationNumber, modelYear=car.modelYear,
            price=car.price, owner_id=car.owner_id,
            owner=f"{car.owner.firstname} {car.owner.lastname}" if car.owner else None,
            owner_firstname=car.owner.firstname if car.owner else None,
            owner_lastname=car.owner.lastname if car.owner else None
        )
        for car in cars
    ]

@app.post("/cars/search", response_model=List[CarWithOwner])
def search_cars(query: CarQuery, db: Session = Depends(get_db)):
    """Продвинутый поиск автомобилей с фильтрацией и сортировкой"""
    log.debug(f"Advanced car search: {query.model_dump()}")
    cars = CarCRUD.search_cars(db, query)
    return [
        CarWithOwner(
            id=car.id, brand=car.brand, model=car.model, color=car.color,
            registrationNumber=car.registrationNumber, modelYear=car.modelYear,
            price=car.price, owner_id=car.owner_id,
            owner=f"{car.owner.firstname} {car.owner.lastname}" if car.owner else None,
            owner_firstname=car.owner.firstname if car.owner else None,
            owner_lastname=car.owner.lastname if car.owner else None
        )
        for car in cars
    ]

# ==================== OWNER ENDPOINTS ====================

@app.get("/owners", response_model=List[OwnerResponse])
def get_owners(
    skip: int = Query(0, ge=0, description="Количество записей для пропуска"),
    limit: int = Query(100, ge=1, le=1000, description="Максимальное количество записей"),
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(get_current_user)
):
    """Получить всех владельцев с пагинацией"""
    log.debug(f"Getting owners: skip={skip}, limit={limit}")
    return OwnerCRUD.get_all(db, skip=skip, limit=limit)

@app.get("/owners/statistics")
def get_owner_statistics(db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    """Получить статистику по владельцам с количеством автомобилей"""
    log.debug("Getting owner statistics")
    return OwnerCRUD.get_owners_with_car_count(db)

@app.get("/owners/{owner_id}", response_model=OwnerResponse)
def get_owner(owner_id: int, db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    """Получить владельца по ID"""
    log.debug(f"Getting owner with ID: {owner_id}")
    owner = OwnerCRUD.get_by_id(db, owner_id)
    if not owner:
        raise HTTPException(status_code=404, detail="Владелец не найден")
    return owner

@app.post("/owners", response_model=OwnerResponse)
def create_owner(owner: OwnerCreate, db: Session = Depends(get_db), current_user: AppUser = Depends(role_required("ADMIN"))):
    """Создать нового владельца"""
    log.debug(f"Creating owner: {owner.firstname} {owner.lastname}")
    return OwnerCRUD.create(db, owner)

@app.put("/owners/{owner_id}", response_model=OwnerResponse)
def update_owner(owner_id: int, owner_update: OwnerUpdate, db: Session = Depends(get_db), current_user: AppUser = Depends(role_required("ADMIN"))):
    """Обновить владельца"""
    log.debug(f"Updating owner with ID: {owner_id}")
    owner = OwnerCRUD.update(db, owner_id, owner_update)
    if not owner:
        raise HTTPException(status_code=404, detail="Владелец не найден")
    return owner

@app.delete("/owners/{owner_id}", response_model=MessageResponse)
def delete_owner(owner_id: int, db: Session = Depends(get_db), current_user: AppUser = Depends(role_required("ADMIN"))):
    """Удалить владельца (с каскадным удалением автомобилей)"""
    log.debug(f"Deleting owner with ID: {owner_id}")
    success = OwnerCRUD.delete(db, owner_id)
    if not success:
        raise HTTPException(status_code=404, detail="Владелец не найден")
    return MessageResponse(message="Владелец и все его автомобили успешно удалены")

@app.get("/owners/search/{search_term}", response_model=List[OwnerResponse])
def search_owners_by_term(search_term: str, db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    """Найти владельцев по любому полю (имя или фамилия)"""
    log.debug(f"Searching owners by term: {search_term}")
    return OwnerCRUD.search_by_any_field(db, search_term)

@app.post("/owners/search", response_model=List[OwnerResponse])
def search_owners(query: OwnerQuery, db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    """Продвинутый поиск владельцев с фильтрацией и сортировкой"""
    log.debug(f"Advanced owner search: {query.model_dump()}")
    return OwnerCRUD.search_owners(db, query)

# ==================== USER MANAGEMENT ENDPOINTS ====================

@app.get("/admin/users", response_model=List[UserResponse])
def get_all_users(
    skip: int = Query(0, ge=0, description="Количество записей для пропуска"),
    limit: int = Query(100, ge=1, le=1000, description="Максимальное количество записей"),
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(role_required("ADMIN"))
):
    """Получить список всех пользователей (только для администраторов)"""
    log.debug(f"Getting all users: skip={skip}, limit={limit}")
    users = db.query(AppUser).offset(skip).limit(limit).all()
    return users

@app.get("/admin/users/{user_id}", response_model=UserResponse)
def get_user_by_id(user_id: int, db: Session = Depends(get_db), current_user: AppUser = Depends(role_required("ADMIN"))):
    """Получить пользователя по ID (только для администраторов)"""
    log.debug(f"Getting user by ID: {user_id}")
    user = db.query(AppUser).filter(AppUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user

@app.put("/admin/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int, 
    user_update: dict,
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(role_required("ADMIN"))
):
    """Обновить пользователя (только для администраторов)"""
    log.debug(f"Updating user {user_id}: {user_update}")
    user = db.query(AppUser).filter(AppUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Обновляем только переданные поля
    for field, value in user_update.items():
        if hasattr(user, field) and field != 'id':
            setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

@app.delete("/admin/users/{user_id}", response_model=MessageResponse)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: AppUser = Depends(role_required("ADMIN"))):
    """Удалить пользователя (только для администраторов)"""
    log.debug(f"Deleting user: {user_id}")
    user = db.query(AppUser).filter(AppUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Нельзя удалить самого себя
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Нельзя удалить самого себя")
    
    db.delete(user)
    db.commit()
    return MessageResponse(message="Пользователь успешно удален")

# ==================== ANALYTICS ENDPOINTS ====================

@app.get("/analytics/overview")
def get_analytics_overview(db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    """Получить общую аналитику системы"""
    log.debug("Getting analytics overview")
    
    # Подсчитываем статистику
    total_cars = db.query(Car).count()
    total_owners = db.query(Owner).count()
    total_users = db.query(AppUser).count()
    
    # Средняя цена автомобилей
    avg_price_result = db.query(func.avg(Car.price)).scalar()
    avg_price = float(avg_price_result) if avg_price_result else 0
    
    # Самый дорогой автомобиль
    most_expensive_car = db.query(Car).order_by(Car.price.desc()).first()
    
    # Статистика по владельцам
    owners_with_cars = db.query(Owner).join(Car).distinct().count()
    
    return {
        "total_cars": total_cars,
        "total_owners": total_owners,
        "total_users": total_users,
        "average_car_price": round(avg_price, 2),
        "most_expensive_car": {
            "brand": most_expensive_car.brand if most_expensive_car else None,
            "model": most_expensive_car.model if most_expensive_car else None,
            "price": most_expensive_car.price if most_expensive_car else 0
        } if most_expensive_car else None,
        "owners_with_cars": owners_with_cars,
        "owners_without_cars": total_owners - owners_with_cars
    }

@app.get("/analytics/cars-by-year")
def get_cars_by_year(db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    """Получить статистику автомобилей по годам"""
    log.debug("Getting cars by year statistics")
    
    # Группируем автомобили по годам
    year_stats = db.query(
        Car.modelYear,
        func.count(Car.id).label('count'),
        func.avg(Car.price).label('avg_price')
    ).group_by(Car.modelYear).order_by(Car.modelYear).all()
    
    return [
        {
            "year": stat.modelYear,
            "count": stat.count,
            "average_price": round(float(stat.avg_price), 2) if stat.avg_price else 0
        }
        for stat in year_stats
    ]

@app.get("/analytics/owners-stats")
def get_owners_statistics(db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    """Получить статистику владельцев"""
    log.debug("Getting owners statistics")
    
    # Владельцы с количеством автомобилей
    owner_stats = db.query(
        Owner.ownerid,
        Owner.firstname,
        Owner.lastname,
        func.count(Car.id).label('car_count')
    ).outerjoin(Car).group_by(Owner.ownerid, Owner.firstname, Owner.lastname).all()
    
    return [
        {
            "owner_id": stat.ownerid,
            "name": f"{stat.firstname} {stat.lastname}",
            "car_count": stat.car_count
        }
        for stat in owner_stats
    ]

# ==================== SYSTEM SETTINGS ENDPOINTS ====================

@app.get("/settings")
def get_system_settings(db: Session = Depends(get_db), current_user: AppUser = Depends(role_required("ADMIN"))):
    """Получить настройки системы (только для администраторов)"""
    log.debug("Getting system settings")
    
    # Здесь можно добавить настройки из базы данных или конфигурационных файлов
    return {
        "system_name": "Car Management System",
        "version": "1.0.0",
        "max_cars_per_owner": 10,
        "max_users": 1000,
        "maintenance_mode": False,
        "registration_enabled": True,
        "admin_notifications": True
    }

@app.put("/settings")
def update_system_settings(
    settings: dict,
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(role_required("ADMIN"))
):
    """Обновить настройки системы (только для администраторов)"""
    log.debug(f"Updating system settings: {settings}")
    
    # Здесь можно сохранить настройки в базу данных
    # Пока что просто возвращаем обновленные настройки
    return {
        "message": "Настройки системы обновлены",
        "updated_settings": settings
    }

@app.get("/settings/backup")
def create_system_backup(db: Session = Depends(get_db), current_user: AppUser = Depends(role_required("ADMIN"))):
    """Создать резервную копию системы (только для администраторов)"""
    log.debug("Creating system backup")
    
    # Здесь можно добавить логику создания резервной копии
    return {
        "message": "Резервная копия создана",
        "backup_id": f"backup_{int(time.time())}",
        "created_at": datetime.now().isoformat()
    }

@app.get("/settings/logs")
def get_system_logs(
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(role_required("ADMIN"))
):
    """Получить логи системы (только для администраторов)"""
    log.debug(f"Getting system logs: limit={limit}")
    
    # Здесь можно добавить логику получения логов
    return {
        "message": "Логи системы",
        "logs": [
            {
                "timestamp": datetime.now().isoformat(),
                "level": "INFO",
                "message": "Система запущена"
            }
        ]
    }