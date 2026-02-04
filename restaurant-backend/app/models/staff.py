from sqlalchemy import Column, Integer, String
from app.db.database import Base


class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    phone = Column(String(20), unique=True, nullable=False)

    role = Column(String(50), nullable=False)

    pin = Column(String(255), nullable=False)  # hashed
