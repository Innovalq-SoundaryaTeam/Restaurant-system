from pydantic import BaseModel

class AttendanceCreate(BaseModel):
    name: str
    status: str
    date_time: str  # This must match your Database column name exactly

class AttendanceResponse(AttendanceCreate):
    id: int
    class Config:
        from_attributes = True