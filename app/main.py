import logging
import os
from typing import List, Optional
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .db import SessionLocal, init_db_with_seed
from .schemas import (
    CarCreate, CarUpdate, CarResponse, CarWithOwner, CarQuery,
    OwnerCreate, OwnerUpdate, OwnerResponse, OwnerQuery,
    StatusResponse, MessageResponse
)
from .crud import CarCRUD, OwnerCRUD

# Load config
load_dotenv()
APP_NAME = os.getenv("APP_NAME", "Lab1 FastAPI")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")

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

@app.on_event("startup")
async def on_startup():
    init_db_with_seed()
    log.info("🚀 Application started")

# ==================== BASIC ENDPOINTS ====================

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

# ==================== CAR ENDPOINTS ====================

@app.get("/cars", response_model=List[CarWithOwner])
def get_cars(
    skip: int = Query(0, ge=0, description="Количество записей для пропуска"),
    limit: int = Query(100, ge=1, le=1000, description="Максимальное количество записей"),
    db: Session = Depends(get_db)
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
def create_car(car: CarCreate, db: Session = Depends(get_db)):
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
def update_car(car_id: int, car_update: CarUpdate, db: Session = Depends(get_db)):
    """Обновить автомобиль"""
    log.debug(f"Updating car with ID: {car_id}")
    car = CarCRUD.update(db, car_id, car_update)
    if not car:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")
    # Загружаем владельца
    car = CarCRUD.get_by_id(db, car_id)
    return CarResponse.model_validate(car)

@app.delete("/cars/{car_id}", response_model=MessageResponse)
def delete_car(car_id: int, db: Session = Depends(get_db)):
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
    db: Session = Depends(get_db)
):
    """Получить всех владельцев с пагинацией"""
    log.debug(f"Getting owners: skip={skip}, limit={limit}")
    return OwnerCRUD.get_all(db, skip=skip, limit=limit)

@app.get("/owners/statistics")
def get_owner_statistics(db: Session = Depends(get_db)):
    """Получить статистику по владельцам с количеством автомобилей"""
    log.debug("Getting owner statistics")
    return OwnerCRUD.get_owners_with_car_count(db)

@app.get("/owners/{owner_id}", response_model=OwnerResponse)
def get_owner(owner_id: int, db: Session = Depends(get_db)):
    """Получить владельца по ID"""
    log.debug(f"Getting owner with ID: {owner_id}")
    owner = OwnerCRUD.get_by_id(db, owner_id)
    if not owner:
        raise HTTPException(status_code=404, detail="Владелец не найден")
    return owner

@app.post("/owners", response_model=OwnerResponse)
def create_owner(owner: OwnerCreate, db: Session = Depends(get_db)):
    """Создать нового владельца"""
    log.debug(f"Creating owner: {owner.firstname} {owner.lastname}")
    return OwnerCRUD.create(db, owner)

@app.put("/owners/{owner_id}", response_model=OwnerResponse)
def update_owner(owner_id: int, owner_update: OwnerUpdate, db: Session = Depends(get_db)):
    """Обновить владельца"""
    log.debug(f"Updating owner with ID: {owner_id}")
    owner = OwnerCRUD.update(db, owner_id, owner_update)
    if not owner:
        raise HTTPException(status_code=404, detail="Владелец не найден")
    return owner

@app.delete("/owners/{owner_id}", response_model=MessageResponse)
def delete_owner(owner_id: int, db: Session = Depends(get_db)):
    """Удалить владельца (с каскадным удалением автомобилей)"""
    log.debug(f"Deleting owner with ID: {owner_id}")
    success = OwnerCRUD.delete(db, owner_id)
    if not success:
        raise HTTPException(status_code=404, detail="Владелец не найден")
    return MessageResponse(message="Владелец и все его автомобили успешно удалены")

@app.get("/owners/search/{search_term}", response_model=List[OwnerResponse])
def search_owners_by_term(search_term: str, db: Session = Depends(get_db)):
    """Найти владельцев по любому полю (имя или фамилия)"""
    log.debug(f"Searching owners by term: {search_term}")
    return OwnerCRUD.search_by_any_field(db, search_term)

@app.post("/owners/search", response_model=List[OwnerResponse])
def search_owners(query: OwnerQuery, db: Session = Depends(get_db)):
    """Продвинутый поиск владельцев с фильтрацией и сортировкой"""
    log.debug(f"Advanced owner search: {query.model_dump()}")
    return OwnerCRUD.search_owners(db, query)