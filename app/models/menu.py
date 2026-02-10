from sqlalchemy import Column, Integer, String, Float, Boolean, Text
from app.db.database import Base


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    category = Column(String(100))
    image_url = Column(Text)
    is_available = Column(Boolean, default=True)
    preparation_time = Column(Integer, default=15)
    spicy_level = Column(String(20), default="none")
    dietary_info = Column(String(20), default="non-veg")
