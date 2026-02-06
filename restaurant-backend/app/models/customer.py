from sqlalchemy import Column, Integer, String
from app.db.database import Base
from sqlalchemy import DateTime
from sqlalchemy.sql import func



class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    phone_number = Column(String(20), nullable=False, index=True)

    email = Column(String(150), nullable=True, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

