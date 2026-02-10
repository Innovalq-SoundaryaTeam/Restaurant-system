from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy import func

from app.models.order import Order, OrderItem
from app.models.customer import Customer
from app.models.menu import MenuItem
from app.models.enums import OrderStatus


def create_order(db: Session, table_number: str, phone_number: str, items: list):
    
    # sanitize phone number (VERY IMPORTANT)
    clean_phone = str(phone_number).strip()

    # create or get customer (no OTP verification needed)
    customer = db.query(Customer).filter(
        Customer.phone_number == clean_phone
    ).first()

    if not customer:
        # Create new customer if doesn't exist
        customer = Customer(
            name="Walk-in Customer",
            phone_number=clean_phone,
            email="",
            is_verified=1
        )
        db.add(customer)
        db.flush()

    # create order - let database trigger handle order_number
    order = Order(
        table_number=table_number,  # Keep as string
        customer_id=customer.id,
        status="PENDING",
        total_price=0  # Will be updated later
    )

    db.add(order)
    db.flush()  # get order ID

    total = 0

    # process items
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

    # Update total price
    order.total_price = total

    db.commit()
    db.refresh(order)

    return order
