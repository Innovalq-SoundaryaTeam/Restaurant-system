from sqlalchemy import Column, Integer, String
from app.db.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    phone_number = Column(String(20), unique=True, nullable=False)

    otp = Column(String(6), nullable=True)

    is_verified = Column(Integer, default=0)
