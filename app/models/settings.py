from sqlalchemy import Column, Integer, String
from app.core.database import Base


class RestaurantProfile(Base):
    __tablename__ = "restaurant_profile"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(255), nullable=False)
    phone = Column(String(20))
    email = Column(String(255))
    gst = Column(String(50))
    currency = Column(String(10), default="₹")
    timezone = Column(String(100))
    address = Column(String(500))
