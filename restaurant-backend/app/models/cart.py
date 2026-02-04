from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.database import Base


class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(500), index=True)
