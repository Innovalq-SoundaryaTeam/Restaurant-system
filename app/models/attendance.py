from sqlalchemy import Column, Integer, String, DateTime
from app.db.database import Base# Or your project's Base
from datetime import datetime

class Attendance(Base):
    __tablename__ = "attendance_records"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False)
    date_time = Column(String(100), nullable=False) # Matches your JSX format