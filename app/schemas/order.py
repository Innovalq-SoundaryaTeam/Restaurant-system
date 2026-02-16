from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.order import OrderStatus, PaymentMethod, OrderType


class OrderItemBase(BaseModel):
    menu_item_id: int
    quantity: int
    special_instructions: Optional[str] = None


class OrderItemCreate(OrderItemBase):
    price: float
    subtotal: float


class OrderItemResponse(BaseModel):
    id: int
    menu_item_id: int
    quantity: int
    price: float
    subtotal: float
    special_instructions: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    table_number: Optional[str] = None
    special_instructions: Optional[str] = None
    payment_method: PaymentMethod = PaymentMethod.UPI


class OrderCreate(OrderBase):
    customer_name: str
    phone_number: str
    email: Optional[str] = None
    items: List[OrderItemBase]


class OrderResponse(BaseModel):
    id: int
    order_number: Optional[str]
    customer_id: Optional[int]
    table_number: Optional[str]
    order_type: OrderType
    status: OrderStatus
    total_price: float
    subtotal: Optional[float]
    tax_amount: float
    discount_amount: float
    payment_method: Optional[PaymentMethod]
    payment_status: str
    special_instructions: Optional[str]
    order_date: Optional[datetime]
    order_time: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class OrderDetailResponse(OrderResponse):
    customer_name: Optional[str]
    phone_number: Optional[str]
    email: Optional[str]
    items: List[OrderItemResponse]


class KitchenOrderResponse(BaseModel):
    id: int
    order_number: Optional[str]
    table_number: Optional[str]
    customer_name: str
    status: OrderStatus
    total_price: float
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    notes: Optional[str] = None


class TodaySalesResponse(BaseModel):
    date: str
    today_revenue: float
    total_orders: int
    paid_orders: int
