from sqlalchemy import Column, Integer, Float, String, ForeignKey, Enum, Date, Time, Text, Numeric
from app.models.enums import OrderStatus
from app.db.database import Base
from sqlalchemy.sql import func
from sqlalchemy import DateTime
import enum


class PaymentMethod(enum.Enum):
    CASH = "cash"
    CARD = "card"
    UPI = "upi"
    WALLET = "wallet"


class PaymentStatus(enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    REFUNDED = "refunded"


class OrderType(enum.Enum):
    DINE_IN = "dine-in"
    TAKEAWAY = "takeaway"
    DELIVERY = "delivery"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    table_number = Column(String(20), nullable=True)
    order_type = Column(Enum(OrderType), default=OrderType.DINE_IN)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    total_price = Column(Numeric(10, 2), default=0)
    subtotal = Column(Numeric(10, 2))
    tax_amount = Column(Numeric(10, 2), default=0)
    discount_amount = Column(Numeric(10, 2), default=0)
    payment_method = Column(Enum(PaymentMethod), default=PaymentMethod.UPI)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    special_instructions = Column(Text)
    order_date = Column(Date, nullable=False, server_default=func.current_date())
    order_time = Column(Time, nullable=False, server_default=func.current_time())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    price = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)
    special_instructions = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
