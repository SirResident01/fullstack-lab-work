from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, ForeignKey

class Base(DeclarativeBase):
    pass

class Owner(Base):
    __tablename__ = "owner"
    ownerid: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    firstname: Mapped[str] = mapped_column(String(100))
    lastname:  Mapped[str] = mapped_column(String(100))
    cars: Mapped[list["Car"]] = relationship(
        back_populates="owner",
        cascade="all, delete-orphan"
    )

class Car(Base):
    __tablename__ = "car"
    id:   Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    brand: Mapped[str] = mapped_column(String(100))
    model: Mapped[str] = mapped_column(String(100))
    color: Mapped[str] = mapped_column(String(40))
    registrationNumber: Mapped[str] = mapped_column(String(40))
    modelYear: Mapped[int] = mapped_column(Integer)
    price: Mapped[int] = mapped_column(Integer)
    owner_id: Mapped[int] = mapped_column(ForeignKey("owner.ownerid"))
    owner: Mapped["Owner"] = relationship(back_populates="cars")

