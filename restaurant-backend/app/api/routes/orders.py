from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from datetime import datetime, date

from app.db.database import get_db
from app.services.order_service import create_order

# ✅ Import ALL models properly
from app.models.order import Order, OrderItem
from app.models.customer import Customer
from app.models.menu import MenuItem


router = APIRouter()


# ✅ PLACE ORDER
@router.post("/orders")
def place_order(payload: dict, db: Session = Depends(get_db)):

    order = create_order(
        db=db,
        table_number=payload["table_number"],
        phone_number=payload["phone_number"],
        items=payload["items"]
    )

    return {
        "message": "Order placed successfully!",
        "order_id": order.id,
        "order_number": order.order_number,
        "total": order.total_price
    }


# ✅ KITCHEN VIEW
@router.get("/kitchen/orders")
def get_kitchen_orders(db: Session = Depends(get_db)):

    orders = db.query(Order).filter(
        Order.status != "paid"
    ).order_by(Order.created_at).all()

    return orders


# ✅ UPDATE ORDER STATUS
@router.put("/kitchen/orders/{order_id}")
def update_order_status(order_id: int, status: str, db: Session = Depends(get_db)):

    valid_status = ["pending", "preparing", "ready", "paid"]

    if status not in valid_status:
        raise HTTPException(status_code=400, detail="Invalid status")

    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status
    db.commit()

    return {
        "message": f"Order marked as {status}"
    }


# ✅ BILLING
@router.put("/billing/pay/{order_id}")
def mark_order_paid(order_id: int, payment_method: str, db: Session = Depends(get_db)):

    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status == "paid":
        raise HTTPException(status_code=400, detail="Order already paid")

    order.status = "paid"
    order.payment_method = payment_method
    order.paid_at = datetime.utcnow()

    db.commit()

    return {
        "message": f"Order paid via {payment_method}"
    }


# ✅ TODAY SALES (OWNER FAVORITE)
@router.get("/reports/today-sales")
def today_sales(db: Session = Depends(get_db)):

    today = date.today()

    total_sales = db.query(
        func.sum(Order.total_price)
    ).filter(
        func.date(Order.paid_at) == today
    ).scalar()

    total_orders = db.query(Order).filter(
        func.date(Order.paid_at) == today
    ).count()

    return {
        "date": str(today),
        "today_revenue": float(total_sales or 0),
        "total_orders": total_orders
    }


# ✅ ORDER DETAILS (CLIENT WOW FEATURE)
@router.get("/orders/{order_id}")
def get_order_details(order_id: int, db: Session = Depends(get_db)):

    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    customer = db.query(Customer).filter(
        Customer.id == order.customer_id
    ).first()

    items = db.query(OrderItem).filter(
        OrderItem.order_id == order.id
    ).all()

    item_list = []

    for item in items:

        menu_item = db.query(MenuItem).filter(
            MenuItem.id == item.menu_item_id
        ).first()

        item_list.append({
            "name": menu_item.name,
            "quantity": item.quantity,
            "price": item.price
        })

    return {
        "order_number": order.order_number,
        "table": order.table_number,
        "customer_name": customer.name if customer else None,
        "phone": customer.phone_number if customer else None,
        "status": order.status,
        "payment_method": order.payment_method,
        "total": order.total_price,
        "items": item_list
    }
