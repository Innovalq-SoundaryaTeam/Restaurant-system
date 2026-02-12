from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime
from app.db.database import Base
from sqlalchemy.sql import func
import enum


class SessionStatus(enum.Enum):
    ACTIVE = "ACTIVE"
    CLOSED = "CLOSED"


class OrderSession(Base):
    __tablename__ = "order_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(50), unique=True, nullable=False, index=True)
    table_number = Column(String(20), nullable=False)
    status = Column(Enum(SessionStatus), default=SessionStatus.ACTIVE, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    closed_at = Column(DateTime(timezone=True), nullable=True)
