from pydantic import BaseModel


class StaffResponse(BaseModel):
    id: int
    name: str
    phone: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True   # Important for SQLAlchemy
