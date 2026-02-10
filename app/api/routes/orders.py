from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

from app.db.database import get_db
from app.models.order import (
    Order,
    OrderItem,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
)
from app.models.customer import Customer
from app.models.menu import MenuItem

router = APIRouter()

# -------------------- Request Schemas --------------------

class OrderItemRequest(BaseModel):
    menu_item_id: int
    quantity: int
    special_instructions: Optional[str] = None


class PlaceOrderRequest(BaseModel):
    table_number: str
    customer_name: str
    phone_number: str
    email: Optional[str] = None
    items: List[OrderItemRequest]
    special_instructions: Optional[str] = None
    payment_method: PaymentMethod = PaymentMethod.UPI


class UpdateOrderStatusRequest(BaseModel):
    status: str


# -------------------- Place Order --------------------

@router.post("/orders")
def place_order(order_request: PlaceOrderRequest, db: Session = Depends(get_db)):

    if not order_request.table_number.strip():
        raise HTTPException(status_code=400, detail="Table number is required")

    customer = db.query(Customer).filter(
        Customer.phone_number == order_request.phone_number
    ).first()

    if not customer:
        customer = Customer(
            name=order_request.customer_name,
            phone_number=order_request.phone_number,
            email=order_request.email,
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

    total_price = 0
    order_items_data = []

    for item_request in order_request.items:
        menu_item = db.query(MenuItem).filter(
            MenuItem.id == item_request.menu_item_id
        ).first()

        if not menu_item:
            raise HTTPException(
                status_code=404,
                detail=f"Menu item {item_request.menu_item_id} not found",
            )

        item_total = menu_item.price * item_request.quantity
        total_price += item_total

        order_items_data.append(
            {
                "menu_item_id": menu_item.id,
                "quantity": item_request.quantity,
                "price": menu_item.price,
                "subtotal": item_total,
                "special_instructions": item_request.special_instructions,
            }
        )

    order = Order(
        customer_id=customer.id,
        table_number=order_request.table_number,
        total_price=total_price,
        subtotal=total_price,
        payment_method=order_request.payment_method,
        payment_status=PaymentStatus.PENDING,
        status=OrderStatus.PENDING,
        special_instructions=order_request.special_instructions,
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    for item_data in order_items_data:
        db.add(OrderItem(order_id=order.id, **item_data))

    db.commit()
    db.refresh(order)

    return {
        "id": order.id,
        "order_number": order.order_number,
        "table_number": order.table_number,
        "status": order.status.value,
        "total_price": float(order.total_price),
        "message": "Order placed successfully",
    }


# -------------------- Kitchen Orders --------------------

@router.get("/kitchen/orders")
def get_kitchen_orders(status: Optional[str] = None, db: Session = Depends(get_db)):

    query = db.query(Order)

    if status:
        try:
            query = query.filter(Order.status == OrderStatus[status.upper()])
        except KeyError:
            raise HTTPException(status_code=400, detail="Invalid status")
    else:
        query = query.filter(
            Order.status.in_(
                [
                    OrderStatus.PENDING,
                    OrderStatus.CONFIRMED,
                    OrderStatus.PREPARING,
                    OrderStatus.READY,
                ]
            )
        )

    orders = query.order_by(Order.created_at).all()
    result = []

    for order in orders:
        customer = db.query(Customer).filter(
            Customer.id == order.customer_id
        ).first()

        items = db.query(OrderItem).filter(
            OrderItem.order_id == order.id
        ).all()

        result.append(
            {
                "id": order.id,
                "order_number": order.order_number,
                "table_number": order.table_number,
                "customer_name": customer.name if customer else "Unknown",
                "status": order.status.value,
                "total_price": float(order.total_price),
                "created_at": order.created_at.isoformat(),
                "items": [
                    {
                        "id": item.id,
                        "name": db.query(MenuItem)
                        .get(item.menu_item_id)
                        .name,
                        "quantity": item.quantity,
                        "price": float(item.price),
                        "subtotal": float(item.subtotal),
                    }
                    for item in items
                ],
            }
        )

    return result


# -------------------- Update Order Status (✅ FIXED) --------------------

@router.put("/kitchen/orders/{order_id}")
def update_order_status_route(
    order_id: int,
    payload: UpdateOrderStatusRequest,
    db: Session = Depends(get_db),
):

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    try:
        order.status = OrderStatus[payload.status.upper()]
    except KeyError:
        raise HTTPException(status_code=400, detail="Invalid status")

    db.commit()
    db.refresh(order)

    return {
        "message": f"Order {order.order_number} updated",
        "order_id": order.id,
        "status": order.status.value,
    }


# -------------------- Reports --------------------

@router.get("/reports/today-sales")
def today_sales(db: Session = Depends(get_db)):

    today = date.today()

    orders_query = db.query(Order).filter(
        func.date(Order.created_at) == today
    )

    total_sales = (
        orders_query.with_entities(func.sum(Order.total_price)).scalar()
        or 0
    )

    total_orders = orders_query.count()

    paid_orders = orders_query.filter(
        Order.payment_status == PaymentStatus.PAID
    ).count()

    return {
        "date": str(today),
        "today_revenue": float(total_sales),
        "total_orders": total_orders,
        "paid_orders": paid_orders,
    }
