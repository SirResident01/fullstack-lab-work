from pydantic import BaseModel, ConfigDict, Field, validator
from typing import Optional, List
from datetime import datetime

# ==================== CAR SCHEMAS ====================

class CarBase(BaseModel):
    brand: str = Field(..., min_length=1, max_length=100, description="Марка автомобиля")
    model: str = Field(..., min_length=1, max_length=100, description="Модель автомобиля")
    color: str = Field(..., min_length=1, max_length=40, description="Цвет автомобиля")
    registrationNumber: str = Field(..., min_length=1, max_length=40, description="Регистрационный номер")
    modelYear: int = Field(..., ge=1900, le=2030, description="Год выпуска")
    price: int = Field(..., ge=0, description="Цена в тенге")
    owner_id: int = Field(..., gt=0, description="ID владельца")

class CarCreate(CarBase):
    pass

class CarUpdate(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    registrationNumber: Optional[str] = None
    modelYear: Optional[int] = None
    price: Optional[int] = None
    owner_id: Optional[int] = None

class CarResponse(CarBase):
    model_config = ConfigDict(from_attributes=True)
    id: int

class CarForOwner(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    brand: str
    model: str
    color: str
    registrationNumber: str
    modelYear: int
    price: int
    owner_id: int

class CarWithOwner(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    brand: str
    model: str
    color: str
    registrationNumber: str
    modelYear: int
    price: int
    owner_id: int
    owner: Optional[str] = None
    owner_firstname: Optional[str] = None
    owner_lastname: Optional[str] = None

# ==================== OWNER SCHEMAS ====================

class OwnerBase(BaseModel):
    firstname: str
    lastname: str

class OwnerCreate(OwnerBase):
    pass

class OwnerUpdate(BaseModel):
    firstname: Optional[str] = None
    lastname: Optional[str] = None

class OwnerResponse(OwnerBase):
    model_config = ConfigDict(from_attributes=True)
    ownerid: int
    cars: List[CarForOwner] = []

# ==================== QUERY SCHEMAS ====================

class CarQuery(BaseModel):
    brand: Optional[str] = None
    color: Optional[str] = None
    modelYear: Optional[int] = None
    minPrice: Optional[int] = None
    maxPrice: Optional[int] = None
    owner_id: Optional[int] = None
    sort_by: Optional[str] = "id"
    sort_order: Optional[str] = "asc"
    limit: Optional[int] = 100
    offset: Optional[int] = 0

class OwnerQuery(BaseModel):
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    search: Optional[str] = None  # Поиск по любому полю
    sort_by: Optional[str] = "ownerid"
    sort_order: Optional[str] = "asc"
    limit: Optional[int] = 100
    offset: Optional[int] = 0

# ==================== RESPONSE SCHEMAS ====================

class StatusResponse(BaseModel):
    status: str
    app: str
    version: str
    timestamp: datetime

class MessageResponse(BaseModel):
    message: str
    success: bool = True
