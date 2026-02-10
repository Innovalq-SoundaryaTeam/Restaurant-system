from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.order import Order
from app.models.enums import OrderStatus


def update_order_status(db: Session, order_id: int, status: str):
    status = status.upper()

    if status not in OrderStatus.__members__:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status: {status}"
        )

    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = OrderStatus[status]
    db.commit()
    db.refresh(order)

    return order
