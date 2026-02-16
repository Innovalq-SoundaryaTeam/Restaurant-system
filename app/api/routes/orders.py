from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import random
import io

from app.db.database import get_db
from app.models.order import (
    Order,
    OrderItem,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
)
from app.models.order_session import OrderSession, SessionStatus
from app.models.customer import Customer
from app.models.menu import MenuItem
from app.services.websocket_service import websocket_manager
from app.services.order_session_service import OrderSessionService
from app.services.pdf_service import PDFService

router = APIRouter()

# -------------------- Schemas --------------------

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
    session_id: Optional[str] = None

class UpdateOrderStatusRequest(BaseModel):
    status: str

def generate_order_number():
    now = datetime.now().strftime("%Y%m%d%H%M%S")
    random_part = random.randint(100, 999)
    return f"ORD{now}{random_part}"

# -------------------- Place Order --------------------

@router.post("/orders")
async def place_order(order_request: PlaceOrderRequest, db: Session = Depends(get_db)):
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

    if order_request.session_id:
        session = db.query(OrderSession).filter(
            OrderSession.session_id == order_request.session_id
        ).first()
        if not session or session.status == SessionStatus.CLOSED:
            raise HTTPException(status_code=400, detail="Invalid or closed session")
        session_id = order_request.session_id
    else:
        session = OrderSessionService.create_or_get_session(
            db, order_request.table_number, customer.id
        )
        session_id = session.session_id

    total_price = 0
    order_items_data = []

    for item_request in order_request.items:
        menu_item = db.query(MenuItem).filter(MenuItem.id == item_request.menu_item_id).first()
        if not menu_item:
            raise HTTPException(status_code=404, detail="Menu item not found")

        item_total = float(menu_item.price) * item_request.quantity
        total_price += item_total
        order_items_data.append({
            "menu_item_id": menu_item.id,
            "quantity": item_request.quantity,
            "price": menu_item.price,
            "subtotal": item_total,
            "special_instructions": item_request.special_instructions,
        })

    order = Order(
        order_number=generate_order_number(),
        session_id=session_id,
        customer_id=customer.id,
        table_number=order_request.table_number,
        order_date=datetime.now().date(),
        order_time=datetime.now().time(),
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

    for item in order_items_data:
        db.add(OrderItem(order_id=order.id, **item))

    db.commit()
    await websocket_manager.broadcast_new_order({
        "id": order.id,
        "order_number": order.order_number,
        "status": order.status.value,
        "table_number": order.table_number
    })

    return {"id": order.id, "order_number": order.order_number, "session_id": session_id}

# -------------------- Update Order Status (FIXED) --------------------

@router.put("/kitchen/orders/{order_id}")
async def update_order_status(
    order_id: int,
    payload: UpdateOrderStatusRequest,
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    try:
        # Converts string from React (e.g., "KITCHEN") to Enum
        order.status = OrderStatus[payload.status.upper()]
    except KeyError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {payload.status}")

    db.commit()
    db.refresh(order)

    # Notify Tracking Page via WebSocket
    await websocket_manager.broadcast_order_update(order_id, order.status.value)

    return {"order_id": order.id, "status": order.status.value}

# -------------------- Get Kitchen Orders (FIXED DISAPPEARING) --------------------

@router.get("/kitchen/orders")
def get_kitchen_orders(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Order)

    if status:
        try:
            query = query.filter(Order.status == OrderStatus[status.upper()])
        except KeyError:
            raise HTTPException(status_code=400, detail="Invalid status")
    else:
        # FIX: Include KITCHEN and READY so they STAY on the screen
        query = query.filter(
            Order.status.in_([
                OrderStatus.PENDING,
                OrderStatus.KITCHEN,
                OrderStatus.READY,
            ])
        )

    orders = query.order_by(Order.created_at).all()
    result = []

    for order in orders:
        customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()

        result.append({
            "id": order.id,
            "order_number": order.order_number,
            "table_number": order.table_number,
            "customer_name": customer.name if customer else "Guest",
            "status": order.status.value,
            "total_price": float(order.total_price),
            "created_at": order.created_at.isoformat(),
            "items": [
                {
                    "name": db.query(MenuItem).get(item.menu_item_id).name,
                    "quantity": item.quantity,
                } for item in items
            ],
        })
    return result

# -------------------- Get Order by ID (For Track Page) --------------------

@router.get("/orders/{order_id}")
def get_order_by_id(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "id": order.id,
        "order_number": order.order_number,
        "table_number": order.table_number,
        "status": order.status.value,
        "total_price": float(order.total_price),
        "session_id": order.session_id,  # ADD THIS LINE
        "created_at": order.created_at.isoformat(),
    }

# -------------------- Get Full Session Orders (For Multi-Card View) --------------------

@router.get("/sessions/{session_id}")
def get_session_orders(session_id: str, db: Session = Depends(get_db)):
    # 1. Fetch the session details
    session_obj = db.query(OrderSession).filter(OrderSession.session_id == session_id).first()
    if not session_obj:
        raise HTTPException(status_code=404, detail="Session not found")

    # 2. Fetch all orders belonging to this session
    orders = db.query(Order).filter(Order.session_id == session_id).order_by(Order.created_at.asc()).all()
    
    result_orders = []
    for order in orders:
        # Fetch items for each order
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        
        result_orders.append({
            "id": order.id,
            "order_number": order.order_number,
            "status": order.status.value,
            "total_price": float(order.total_price),
            "created_at": order.created_at.isoformat(),
            "items": [
                {
                    "name": db.query(MenuItem).get(item.menu_item_id).name,
                    "quantity": item.quantity,
                    "price": float(item.price),
                    "subtotal": float(item.subtotal)
                } for item in items
            ]
        })

    return {
        "session_id": session_id,
        "table_number": session_obj.table_number,
        "status": session_obj.status.value,
        "orders": result_orders
    }

# -------------------- Get All Orders (For Admin Orders Page) --------------------

@router.get("/orders")
def get_all_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).order_by(Order.created_at.desc()).all()

    result = []

    for order in orders:
        customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()

        result.append({
            "id": order.id,
            "order_number": order.order_number,
            "customer_name": customer.name if customer else "Guest",
            "customer_phone": customer.phone_number if customer else "",
            "order_date": order.order_date.isoformat() if order.order_date else "",
            "order_time": str(order.order_time) if order.order_time else "",
            "status": order.status.value,
            "total_price": float(order.total_price),
            "items": [
                {
                    "item_name": db.query(MenuItem).get(item.menu_item_id).name,
                    "quantity": item.quantity,
                    "price": float(item.price)
                }
                for item in items
            ]
        })

    return result
