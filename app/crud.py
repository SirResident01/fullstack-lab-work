from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc, asc
from typing import List, Optional
from .models import Car, Owner
from .schemas import CarCreate, CarUpdate, OwnerCreate, OwnerUpdate, CarQuery, OwnerQuery

# ==================== CAR CRUD OPERATIONS ====================

class CarCRUD:
    @staticmethod
    def create(db: Session, car: CarCreate) -> Car:
        """Создать новый автомобиль"""
        # Проверяем, что владелец существует
        from .models import Owner
        owner = db.query(Owner).filter(Owner.ownerid == car.owner_id).first()
        if not owner:
            raise ValueError(f"Владелец с ID {car.owner_id} не найден")
        
        db_car = Car(**car.model_dump())
        db.add(db_car)
        db.commit()
        db.refresh(db_car)
        return db_car

    @staticmethod
    def get_by_id(db: Session, car_id: int) -> Optional[Car]:
        """Получить автомобиль по ID"""
        return db.query(Car).options(joinedload(Car.owner)).filter(Car.id == car_id).first()

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Car]:
        """Получить все автомобили с пагинацией"""
        return db.query(Car).options(joinedload(Car.owner)).offset(skip).limit(limit).all()

    @staticmethod
    def update(db: Session, car_id: int, car_update: CarUpdate) -> Optional[Car]:
        """Обновить автомобиль"""
        db_car = db.query(Car).filter(Car.id == car_id).first()
        if db_car:
            update_data = car_update.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_car, field, value)
            db.commit()
            db.refresh(db_car)
        return db_car

    @staticmethod
    def delete(db: Session, car_id: int) -> bool:
        """Удалить автомобиль"""
        db_car = db.query(Car).filter(Car.id == car_id).first()
        if db_car:
            db.delete(db_car)
            db.commit()
            return True
        return False

    # ==================== ADVANCED QUERIES ====================

    @staticmethod
    def find_by_brand(db: Session, brand: str) -> List[Car]:
        """Найти автомобили по марке"""
        return db.query(Car).options(joinedload(Car.owner)).filter(
            Car.brand.ilike(f"%{brand}%")
        ).all()

    @staticmethod
    def find_by_color(db: Session, color: str) -> List[Car]:
        """Найти автомобили по цвету"""
        return db.query(Car).options(joinedload(Car.owner)).filter(
            Car.color.ilike(f"%{color}%")
        ).all()

    @staticmethod
    def find_by_model_year(db: Session, year: int) -> List[Car]:
        """Найти автомобили по году выпуска"""
        return db.query(Car).options(joinedload(Car.owner)).filter(
            Car.modelYear == year
        ).all()

    @staticmethod
    def find_by_price_range(db: Session, min_price: int, max_price: int) -> List[Car]:
        """Найти автомобили в диапазоне цен"""
        return db.query(Car).options(joinedload(Car.owner)).filter(
            and_(Car.price >= min_price, Car.price <= max_price)
        ).all()

    @staticmethod
    def find_by_owner(db: Session, owner_id: int) -> List[Car]:
        """Найти автомобили по владельцу"""
        return db.query(Car).options(joinedload(Car.owner)).filter(
            Car.owner_id == owner_id
        ).all()

    @staticmethod
    def search_cars(db: Session, query: CarQuery) -> List[Car]:
        """Продвинутый поиск автомобилей с фильтрацией и сортировкой"""
        q = db.query(Car).options(joinedload(Car.owner))

        # Применяем фильтры
        if query.brand:
            q = q.filter(Car.brand.ilike(f"%{query.brand}%"))
        
        if query.color:
            q = q.filter(Car.color.ilike(f"%{query.color}%"))
        
        if query.modelYear:
            q = q.filter(Car.modelYear == query.modelYear)
        
        if query.minPrice:
            q = q.filter(Car.price >= query.minPrice)
        
        if query.maxPrice:
            q = q.filter(Car.price <= query.maxPrice)
        
        if query.owner_id:
            q = q.filter(Car.owner_id == query.owner_id)

        # Применяем сортировку
        sort_column = getattr(Car, query.sort_by, Car.id)
        if query.sort_order.lower() == "desc":
            q = q.order_by(desc(sort_column))
        else:
            q = q.order_by(asc(sort_column))

        # Применяем пагинацию
        return q.offset(query.offset).limit(query.limit).all()

    @staticmethod
    def get_cars_by_owner_name(db: Session, firstname: str = None, lastname: str = None) -> List[Car]:
        """Найти автомобили по имени владельца"""
        q = db.query(Car).options(joinedload(Car.owner))
        
        if firstname and lastname:
            q = q.join(Owner).filter(
                and_(
                    Owner.firstname.ilike(f"%{firstname}%"),
                    Owner.lastname.ilike(f"%{lastname}%")
                )
            )
        elif firstname:
            q = q.join(Owner).filter(Owner.firstname.ilike(f"%{firstname}%"))
        elif lastname:
            q = q.join(Owner).filter(Owner.lastname.ilike(f"%{lastname}%"))
        
        return q.all()

    @staticmethod
    def get_statistics(db: Session) -> dict:
        """Получить статистику по автомобилям"""
        total_cars = db.query(Car).count()
        total_owners = db.query(Owner).count()
        
        # Средняя цена
        avg_price = db.query(Car.price).all()
        avg_price = sum([car[0] for car in avg_price]) / len(avg_price) if avg_price else 0
        
        # Самый дорогой автомобиль
        most_expensive = db.query(Car).order_by(desc(Car.price)).first()
        
        # Самый дешевый автомобиль
        cheapest = db.query(Car).order_by(asc(Car.price)).first()
        
        return {
            "total_cars": total_cars,
            "total_owners": total_owners,
            "average_price": round(avg_price, 2),
            "most_expensive": {
                "id": most_expensive.id,
                "brand": most_expensive.brand,
                "model": most_expensive.model,
                "price": most_expensive.price
            } if most_expensive else None,
            "cheapest": {
                "id": cheapest.id,
                "brand": cheapest.brand,
                "model": cheapest.model,
                "price": cheapest.price
            } if cheapest else None
        }

# ==================== OWNER CRUD OPERATIONS ====================

class OwnerCRUD:
    @staticmethod
    def create(db: Session, owner: OwnerCreate) -> Owner:
        """Создать нового владельца"""
        db_owner = Owner(**owner.model_dump())
        db.add(db_owner)
        db.commit()
        db.refresh(db_owner)
        return db_owner

    @staticmethod
    def get_by_id(db: Session, owner_id: int) -> Optional[Owner]:
        """Получить владельца по ID"""
        return db.query(Owner).options(joinedload(Owner.cars)).filter(Owner.ownerid == owner_id).first()

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Owner]:
        """Получить всех владельцев с пагинацией"""
        return db.query(Owner).options(joinedload(Owner.cars)).offset(skip).limit(limit).all()

    @staticmethod
    def update(db: Session, owner_id: int, owner_update: OwnerUpdate) -> Optional[Owner]:
        """Обновить владельца"""
        db_owner = db.query(Owner).filter(Owner.ownerid == owner_id).first()
        if db_owner:
            update_data = owner_update.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_owner, field, value)
            db.commit()
            db.refresh(db_owner)
        return db_owner

    @staticmethod
    def delete(db: Session, owner_id: int) -> bool:
        """Удалить владельца (с каскадным удалением автомобилей)"""
        db_owner = db.query(Owner).filter(Owner.ownerid == owner_id).first()
        if db_owner:
            db.delete(db_owner)
            db.commit()
            return True
        return False

    @staticmethod
    def find_by_name(db: Session, firstname: str = None, lastname: str = None) -> List[Owner]:
        """Найти владельцев по имени"""
        q = db.query(Owner).options(joinedload(Owner.cars))
        
        if firstname and lastname:
            q = q.filter(
                and_(
                    Owner.firstname.ilike(f"%{firstname}%"),
                    Owner.lastname.ilike(f"%{lastname}%")
                )
            )
        elif firstname:
            q = q.filter(Owner.firstname.ilike(f"%{firstname}%"))
        elif lastname:
            q = q.filter(Owner.lastname.ilike(f"%{lastname}%"))
        
        return q.all()

    @staticmethod
    def search_by_any_field(db: Session, search_term: str) -> List[Owner]:
        """Найти владельцев по любому полю (имя или фамилия)"""
        q = db.query(Owner).options(joinedload(Owner.cars))
        
        # Поиск по имени ИЛИ фамилии
        q = q.filter(
            or_(
                Owner.firstname.ilike(f"%{search_term}%"),
                Owner.lastname.ilike(f"%{search_term}%")
            )
        )
        
        return q.all()

    @staticmethod
    def search_owners(db: Session, query: OwnerQuery) -> List[Owner]:
        """Продвинутый поиск владельцев с фильтрацией и сортировкой"""
        q = db.query(Owner).options(joinedload(Owner.cars))

        # Применяем фильтры
        if query.search:
            # Общий поиск по имени ИЛИ фамилии
            q = q.filter(
                or_(
                    Owner.firstname.ilike(f"%{query.search}%"),
                    Owner.lastname.ilike(f"%{query.search}%")
                )
            )
        else:
            # Точный поиск по конкретным полям
            if query.firstname:
                q = q.filter(Owner.firstname.ilike(f"%{query.firstname}%"))
            
            if query.lastname:
                q = q.filter(Owner.lastname.ilike(f"%{query.lastname}%"))

        # Применяем сортировку
        sort_column = getattr(Owner, query.sort_by, Owner.ownerid)
        if query.sort_order.lower() == "desc":
            q = q.order_by(desc(sort_column))
        else:
            q = q.order_by(asc(sort_column))

        # Применяем пагинацию
        return q.offset(query.offset).limit(query.limit).all()

    @staticmethod
    def get_owners_with_car_count(db: Session) -> List[dict]:
        """Получить владельцев с количеством автомобилей"""
        from sqlalchemy import func
        
        result = db.query(
            Owner.ownerid,
            Owner.firstname,
            Owner.lastname,
            func.count(Car.id).label('car_count')
        ).outerjoin(Car).group_by(Owner.ownerid, Owner.firstname, Owner.lastname).all()
        
        return [
            {
                "ownerid": row.ownerid,
                "firstname": row.firstname,
                "lastname": row.lastname,
                "car_count": row.car_count
            }
            for row in result
        ]
