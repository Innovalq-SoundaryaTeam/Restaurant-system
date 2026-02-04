from sqlalchemy import Column, Integer, Float, String, ForeignKey,Enum
from app.models.enums import OrderStatus
from app.db.database import Base
from sqlalchemy.sql import func
from sqlalchemy import DateTime



class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    # which table placed the order
    table_number = Column(Integer, nullable=False)

    # NEW — link customer phone
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)

    # order flow
    status = Column(
    Enum(OrderStatus),
    default=OrderStatus.PENDING,
    nullable=False
)

    # total bill
    total_price = Column(Float, default=0)
    
    #food time to prepare
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    payment_method = Column(String(20), nullable=True)
    
    paid_at = Column(DateTime(timezone=True), nullable=True)
    
    order_number = Column(String(20), unique=True, nullable=True)





class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)

    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)

    menu_item_id = Column(Integer, nullable=False)

    quantity = Column(Integer, nullable=False)

    price = Column(Float, nullable=False)
