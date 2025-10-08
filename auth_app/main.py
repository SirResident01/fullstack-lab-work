from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
import os

from .database import get_db, init_db
from .models import AppUser, Car
from .schemas import UserCreate, UserResponse, CarCreate, CarResponse, UserLogin, Token
from .auth import create_access_token, get_current_user, role_required, authenticate_user
from .crud import get_cars, create_car, get_car_by_id, update_car, delete_car, create_user

# Initialize FastAPI app
app = FastAPI(
    title="Car Management API with JWT Auth",
    description="FastAPI application with JWT authentication and role-based access control",
    version="1.0.0"
)

# CORS Configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8080").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Authorization"]
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()
    # Seed database with initial data
    await seed_database()

async def seed_database():
    """Seed database with initial users and cars"""
    db = next(get_db())
    
    # Check if users already exist
    if db.query(AppUser).first():
        return
    
    # Create default users
    users_data = [
        {"username": "user", "password": "user", "role": "USER"},
        {"username": "admin", "password": "admin", "role": "ADMIN"}
    ]
    
    for user_data in users_data:
        user_create = UserCreate(**user_data)
        create_user(db, user_create)
    
    # Create sample cars
    cars_data = [
        {"brand": "Toyota", "model": "Camry", "color": "Blue", "year": 2022, "price": 25000.0},
        {"brand": "Honda", "model": "Civic", "color": "Red", "year": 2021, "price": 22000.0},
        {"brand": "Ford", "model": "Mustang", "color": "Black", "year": 2023, "price": 45000.0},
        {"brand": "BMW", "model": "X5", "color": "White", "year": 2022, "price": 60000.0},
        {"brand": "Mercedes", "model": "C-Class", "color": "Silver", "year": 2023, "price": 55000.0}
    ]
    
    for car_data in cars_data:
        car_create = CarCreate(**car_data)
        create_car(db, car_create)
    
    db.close()

# Authentication endpoints
@app.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Login endpoint - returns JWT token"""
    user = authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=1440)  # 24 hours
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: AppUser = Depends(get_current_user)):
    """Get current user information"""
    return current_user

# Car endpoints
@app.get("/cars", response_model=list[CarResponse])
async def read_cars(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(get_current_user)
):
    """Get all cars - accessible to all authenticated users"""
    cars = get_cars(db, skip=skip, limit=limit)
    return cars

@app.post("/cars", response_model=CarResponse)
async def create_car_endpoint(
    car: CarCreate, 
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(role_required("ADMIN"))
):
    """Create new car - only accessible to ADMIN users"""
    return create_car(db, car)

@app.get("/cars/{car_id}", response_model=CarResponse)
async def read_car(
    car_id: int, 
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(get_current_user)
):
    """Get car by ID - accessible to all authenticated users"""
    car = get_car_by_id(db, car_id)
    if car is None:
        raise HTTPException(status_code=404, detail="Car not found")
    return car

@app.put("/cars/{car_id}", response_model=CarResponse)
async def update_car_endpoint(
    car_id: int,
    car: CarCreate,
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(role_required("ADMIN"))
):
    """Update car - only accessible to ADMIN users"""
    db_car = get_car_by_id(db, car_id)
    if db_car is None:
        raise HTTPException(status_code=404, detail="Car not found")
    return update_car(db, car_id, car)

@app.delete("/cars/{car_id}")
async def delete_car_endpoint(
    car_id: int,
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(role_required("ADMIN"))
):
    """Delete car - only accessible to ADMIN users"""
    success = delete_car(db, car_id)
    if not success:
        raise HTTPException(status_code=404, detail="Car not found")
    return {"message": "Car deleted successfully"}

# Admin only endpoint
@app.get("/admin/secret")
async def admin_secret(current_user: AppUser = Depends(role_required("ADMIN"))):
    """Secret endpoint - only accessible to ADMIN users"""
    return {"message": "This is a secret message for admins only!", "user": current_user.username}

# Health check
@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Car Management API with JWT Authentication", "status": "running"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "car-management-api"}

