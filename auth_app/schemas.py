from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# User schemas
class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "USER"

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

# Car schemas
class CarCreate(BaseModel):
    brand: str
    model: str
    color: str
    year: int
    price: float

class CarResponse(BaseModel):
    id: int
    brand: str
    model: str
    color: str
    year: int
    price: float
    
    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

