from pydantic import BaseModel
from typing import Optional


class MenuCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    image_url: Optional[str] = None
    is_available: bool = True
    preparation_time: int = 15
    spicy_level: str = "none"
    dietary_info: str = "non-veg"


class MenuResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    category: Optional[str]
    image_url: Optional[str]
    is_available: bool
    preparation_time: int
    spicy_level: str
    dietary_info: str

    class Config:
        from_attributes = True


class MenuUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    preparation_time: Optional[int] = None
    spicy_level: Optional[str] = None
    dietary_info: Optional[str] = None
