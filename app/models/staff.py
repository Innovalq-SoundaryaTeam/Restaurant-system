from xmlrpc.client import Boolean
from sqlalchemy import Column, Integer, String,Enum, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base


class StaffRole(str, Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    STAFF = "STAFF"


class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(15), unique=True, nullable=False)
    pin = Column(String(255), nullable=False)  # hashed pin
    role = Column(String(50), default="staff")
    is_active = Column(Boolean, default=True)
