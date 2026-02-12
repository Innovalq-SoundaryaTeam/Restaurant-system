from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
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

    # Find or create customer
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

    # Session handling
    if order_request.session_id:
        session = db.query(OrderSession).filter(
            OrderSession.session_id == order_request.session_id
        ).first()

        if not session or session.status == SessionStatus.CLOSED:
            raise HTTPException(status_code=400, detail="Invalid or closed session")

        session_id = order_request.session_id
    else:
        # Create new session for this table
        session = OrderSessionService.create_or_get_session(
            db, order_request.table_number, customer.id
        )
        session_id = session.session_id

    total_price = 0
    order_items_data = []

    for item_request in order_request.items:
        menu_item = db.query(MenuItem).filter(
            MenuItem.id == item_request.menu_item_id
        ).first()

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

    now = datetime.now()

    order = Order(
        order_number=generate_order_number(),
        session_id=session_id,
        customer_id=customer.id,
        table_number=order_request.table_number,
        order_date=now.date(),
        order_time=now.time(),
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

    # Broadcast
    await websocket_manager.broadcast_new_order({
        "id": order.id,
        "order_number": order.order_number,
        "session_id": session_id,
        "table_number": order.table_number,
        "status": order.status.value,
        "total_price": float(order.total_price),
        "created_at": order.created_at.isoformat()
    })

    return {
        "id": order.id,
        "order_number": order.order_number,
        "session_id": session_id,
        "table_number": order.table_number,
        "status": order.status.value,
        "total_price": float(order.total_price),
    }

# -------------------- Get Session by ID --------------------

@router.get("/sessions/{session_id}")
def get_session_by_id(session_id: str, db: Session = Depends(get_db)):
    """Get session details by session_id"""
    session = db.query(OrderSession).filter(
        OrderSession.session_id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    orders = db.query(Order).filter(
        Order.session_id == session_id
    ).order_by(Order.created_at).all()

    return {
        "session_id": session.session_id,
        "table_number": session.table_number,
        "status": session.status.value,
        "created_at": session.created_at.isoformat(),
        "orders": [
            {
                "id": order.id,
                "order_number": order.order_number,
                "status": order.status.value,
                "total_price": float(order.total_price),
                "created_at": order.created_at.isoformat()
            }
            for order in orders
        ]
    }

# -------------------- Finish Meal --------------------

@router.post("/sessions/{session_id}/finish")
def finish_meal_session(session_id: str, db: Session = Depends(get_db)):
    """Finish a meal session and generate final bill"""
    session = db.query(OrderSession).filter(
        OrderSession.session_id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    orders = db.query(Order).filter(
        Order.session_id == session_id
    ).all()

    subtotal = sum(float(o.total_price) for o in orders)
    tax = subtotal * 0.18
    grand_total = subtotal + tax

    session.status = SessionStatus.CLOSED

    for order in orders:
        order.status = OrderStatus.SERVED

    db.commit()

    return {
        "session_id": session_id,
        "subtotal": subtotal,
        "tax": tax,
        "grand_total": grand_total,
        "total_orders": len(orders),
    }

# -------------------- Get Order by ID --------------------

@router.get("/orders/{order_id}")
def get_order_by_id(order_id: int, db: Session = Depends(get_db)):
    """Get order by ID for tracking"""
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "id": order.id,
        "order_number": order.order_number,
        "table_number": order.table_number,
        "status": order.status.value,
        "total_price": float(order.total_price),
        "created_at": order.created_at.isoformat(),
    }

# -------------------- Update Order Status --------------------

@router.put("/kitchen/orders/{order_id}")
async def update_order_status(
    order_id: int,
    payload: UpdateOrderStatusRequest,
    db: Session = Depends(get_db),
):
    """Update order status (kitchen use)"""
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    try:
        order.status = OrderStatus[payload.status.upper()]
    except KeyError:
        raise HTTPException(status_code=400, detail="Invalid status")

    db.commit()
    db.refresh(order)

    await websocket_manager.broadcast_order_update(
        order_id,
        order.status.value
    )

    return {
        "order_id": order.id,
        "status": order.status.value,
    }

# -------------------- Kitchen Orders --------------------

@router.get("/kitchen/orders")
def get_kitchen_orders(status: Optional[str] = None, db: Session = Depends(get_db)):
    """Get kitchen orders for display"""
    query = db.query(Order)

    if status:
        try:
            query = query.filter(Order.status == OrderStatus[status.upper()])
        except KeyError:
            raise HTTPException(status_code=400, detail="Invalid status")
    else:
        query = query.filter(
            Order.status.in_([
                OrderStatus.PENDING,
                OrderStatus.CONFIRMED,
                OrderStatus.PREPARING,
                OrderStatus.READY,
            ])
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

        result.append({
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
                    "name": db.query(MenuItem).get(item.menu_item_id).name,
                    "quantity": item.quantity,
                    "price": float(item.price),
                    "subtotal": float(item.subtotal),
                }
                for item in items
            ],
        })

    return result

# -------------------- Download Session Invoice --------------------

@router.get("/sessions/{session_id}/invoice/download")
def download_session_invoice(session_id: str, db: Session = Depends(get_db)):
    """Download session invoice as PDF"""
    session = db.query(OrderSession).filter(
        OrderSession.session_id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    orders = db.query(Order).filter(
        Order.session_id == session_id
    ).order_by(Order.created_at).all()

    if not orders:
        raise HTTPException(status_code=404, detail="No orders found in session")

    # Get customer info
    customer = db.query(Customer).filter(
        Customer.id == orders[0].customer_id
    ).first()

    # Prepare order data for PDF
    order_data = []
    for order in orders:
        items = db.query(OrderItem).filter(
            OrderItem.order_id == order.id
        ).all()
        
        for item in items:
            menu_item = db.query(MenuItem).get(item.menu_item_id)
            order_data.append({
                'name': menu_item.name,
                'quantity': item.quantity,
                'price': float(item.price),
                'subtotal': float(item.subtotal)
            })

    # Calculate totals
    subtotal = sum(float(order.total_price) for order in orders)
    tax = subtotal * 0.18
    grand_total = subtotal + tax

    # Generate PDF
    invoice_data = {
        'invoice_number': session_id,
        'table_number': session.table_number,
        'customer_name': customer.name if customer else "Guest",
        'orders': order_data,
        'subtotal': subtotal,
        'tax': tax,
        'grand_total': grand_total
    }
    
    pdf_buffer = PDFService().generate_session_invoice_pdf_bytes(invoice_data)
    pdf_bytes = pdf_buffer.getvalue()

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Invoice_{session_id}.pdf"}
    )
