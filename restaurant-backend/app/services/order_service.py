from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.order import Order, OrderItem
from app.models.menu import MenuItem
from app.models.customer import Customer


def generate_order_number(db: Session):
    """
    Generate sequential order numbers like:
    ORD-1000, ORD-1001
    """

    last_order = db.query(Order).order_by(Order.id.desc()).first()

    if last_order:
        next_number = last_order.id + 1000
    else:
        next_number = 1000

    return f"ORD-{next_number}"


def create_order(
    db: Session,
    table_number: int,
    customer_data: dict,
    items: list
):

    # ✅ Validate items
    if not items:
        raise HTTPException(status_code=400, detail="No items provided")

    # ✅ Validate phone
    phone = customer_data.get("phone_number")

    if not phone:
        raise HTTPException(status_code=400, detail="Customer phone number required")

    phone = phone.strip()

    # ✅ Prevent duplicate customers
    customer = db.query(Customer).filter(
        Customer.phone_number == phone
    ).first()

    if not customer:
        customer = Customer(
            name=customer_data.get("name", "Guest"),
            phone_number=phone,
            email=customer_data.get("email")
        )
        db.add(customer)
        db.flush()  # gets customer.id immediately

    # ✅ Generate professional order number
    order_number = generate_order_number(db)

    order = Order(
        order_number=order_number,
        table_number=table_number,
        customer_id=customer.id,
        status="pending"
    )

    db.add(order)
    db.flush()  # gets order.id immediately

    total_price = 0

    # ✅ Process items safely
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

        quantity = item.get("quantity", 1)

        if quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="Quantity must be greater than 0"
            )

        item_total = menu_item.price * quantity

        order_item = OrderItem(
            order_id=order.id,
            menu_item_id=menu_item.id,
            quantity=quantity,
            price=item_total
        )

        db.add(order_item)

        total_price += item_total

    # ✅ Update order total
    order.total_price = total_price

    # ✅ ONE commit only (professional pattern)
    db.commit()

    db.refresh(order)

    return order
