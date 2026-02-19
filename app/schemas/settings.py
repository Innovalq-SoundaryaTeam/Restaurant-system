from pydantic import BaseModel, EmailStr
from typing import Optional


class RestaurantProfileBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    gst: Optional[str] = None
    currency: Optional[str] = "₹"
    timezone: Optional[str] = None
    address: Optional[str] = None


class RestaurantProfileCreate(RestaurantProfileBase):
    pass


class RestaurantProfileOut(RestaurantProfileBase):
    id: int

    class Config:
        from_attributes = True
