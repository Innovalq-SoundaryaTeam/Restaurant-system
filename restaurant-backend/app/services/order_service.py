from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.order import Order, OrderItem
from app.models.menu import MenuItem
from app.models.customer import Customer

import random



def create_order(db: Session, table_number: int, phone_number: str, items: list):
    
    order_number = f"ORD-{random.randint(1000,9999)}"

    order = Order(
    order_number=order_number,
    table_number=table_number,
    customer_id=customer.id,
    status="pending"
    )

    # ✅ sanitize phone number (VERY IMPORTANT)
    clean_phone = str(phone_number).strip()

    # ✅ fetch verified customer
    customer = db.query(Customer).filter(
        Customer.phone_number == clean_phone
    ).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found. Please verify OTP first."
        )

    if customer.is_verified != 1:
        raise HTTPException(
            status_code=400,
            detail="Customer not verified. Please verify OTP first."
        )

    # ✅ create order
    order = Order(
        table_number=table_number,
        customer_id=customer.id,
        status="pending"
    )

    db.add(order)
    db.flush()  # get order ID

    total = 0

    # ✅ process items
    for item in items:

        menu_item = db.query(MenuItem).filter(
            MenuItem.id == item["menu_item_id"],
            MenuItem.is_available == True
        ).first()

        if not menu_item:
            raise HTTPException(
                status_code=404,
                detail=f"Menu item {item['menu_item_id']} not available"
            )

        price = menu_item.price * item["quantity"]

        order_item = OrderItem(
            order_id=order.id,
            menu_item_id=menu_item.id,
            quantity=item["quantity"],
            price=price
        )

        db.add(order_item)

        total += price

    order.total_price = total

    db.commit()
    db.refresh(order)

    return order
