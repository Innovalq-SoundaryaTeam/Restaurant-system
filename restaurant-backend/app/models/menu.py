from sqlalchemy import Column, Integer, String, Float, Boolean
from app.db.database import Base

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    price = Column(Float)
    category = Column(String(50))
    is_available = Column(Boolean, default=True)
    image_url = Column(String(255), nullable=True)

