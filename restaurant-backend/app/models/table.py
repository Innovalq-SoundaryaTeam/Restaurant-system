from sqlalchemy import Column, Integer, String
from app.db.database import Base


class Table(Base):
    __tablename__ = "tables"

    id = Column(Integer, primary_key=True, index=True)

    table_number = Column(Integer, unique=True, nullable=False)

    capacity = Column(Integer, nullable=False)

    status = Column(String(50), default="FREE")  
    # FREE | OCCUPIED | RESERVED | CLEANING
