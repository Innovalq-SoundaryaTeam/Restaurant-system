from sqlalchemy import Column, Integer, String
from app.db.database import Base


class Table(Base):
    __tablename__ = "tables"

    id = Column(Integer, primary_key=True)
    table_number = Column(Integer, unique=True)
    status = Column(String(50), default="free")
