from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.order import Order, OrderItem
from app.models.menu import MenuItem
from app.models.enums import OrderStatus

router = APIRouter()

# ---------------------------------------------------------
# GET KITCHEN ORDERS
# ---------------------------------------------------------
@router.get("/kitchen/orders")
def get_kitchen_orders(
    table_number: str | None = Query(None),
    db: Session = Depends(get_db)
):

    query = db.query(Order).filter(
        Order.status != OrderStatus.SERVED
    )

    # 🔥 Optional table filter
    if table_number:
        query = query.filter(Order.table_number == table_number)

    orders = query.order_by(Order.created_at.desc()).all()

    result = []

    for order in orders:

        items = (
            db.query(OrderItem, MenuItem)
            .join(MenuItem, OrderItem.menu_item_id == MenuItem.id)
            .filter(OrderItem.order_id == order.id)
            .all()
        )

        formatted_items = [
            {
                "name": menu.name,
                "quantity": item.quantity
            }
            for item, menu in items
        ]

        result.append({
            "id": order.id,
            "order_number": order.order_number,
            "status": order.status.value,
            "created_at": order.created_at,
            "table_number": order.table_number,
            "customer_name": f"Customer {order.customer_id}" if order.customer_id else "Walk-in",
            "items": formatted_items
        })

    return result
