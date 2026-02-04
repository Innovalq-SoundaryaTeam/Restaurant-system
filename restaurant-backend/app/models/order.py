from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.sql import func

from app.db.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    # Which table placed the order
    table_number = Column(Integer, nullable=False)

    # Link customer
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)

    # Order lifecycle
    status = Column(String(50), default="pending", index=True)

    # Total bill
    total_price = Column(Float, default=0)

    # Order creation time
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Billing
    payment_method = Column(String(20), nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)

    # Human-friendly order number
    order_number = Column(String(20), unique=True, index=True, nullable=False)


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)

    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)

    menu_item_id = Column(Integer, nullable=False)

    quantity = Column(Integer, nullable=False)

    price = Column(Float, nullable=False)
