from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional

from datetime import datetime, date

from app.db.database import get_db
from app.models.order import Order, OrderItem, OrderStatus, PaymentMethod
from app.models.customer import Customer
from app.models.menu import MenuItem
from app.schemas.order import OrderCreate, OrderResponse, OrderItemCreate

router = APIRouter()

# Request Schemas
class OrderItemRequest(BaseModel):
    menu_item_id: int
    quantity: int
    special_instructions: Optional[str] = None

class PlaceOrderRequest(BaseModel):
    table_number: str  # Required field
    customer_name: str
    phone_number: str
    email: Optional[str] = None
    items: List[OrderItemRequest]
    special_instructions: Optional[str] = None
    payment_method: PaymentMethod = PaymentMethod.UPI

@router.post("/orders")
def place_order(order_request: PlaceOrderRequest, db: Session = Depends(get_db)):
    """Place a new order"""
    
    # Validate table number is provided
    if not order_request.table_number or order_request.table_number.strip() == "":
        raise HTTPException(
            status_code=400, 
            detail="Table number is required"
        )
    
    # Create or get customer
    customer = db.query(Customer).filter(
        Customer.phone_number == order_request.phone_number
    ).first()
    
    if not customer:
        customer = Customer(
            name=order_request.customer_name,
            phone_number=order_request.phone_number,
            email=order_request.email
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)
    
    # Calculate total
    total_price = 0
    order_items_data = []
    
    for item_request in order_request.items:
        menu_item = db.query(MenuItem).filter(MenuItem.id == item_request.menu_item_id).first()
        if not menu_item:
            raise HTTPException(status_code=404, detail=f"Menu item {item_request.menu_item_id} not found")
        
        item_total = menu_item.price * item_request.quantity
        total_price += item_total
        
        order_items_data.append({
            "menu_item_id": item_request.menu_item_id,
            "quantity": item_request.quantity,
            "price": menu_item.price,
            "subtotal": item_total,
            "special_instructions": item_request.special_instructions
        })
    
    # Create order
    order = Order(
        customer_id=customer.id,
        table_number=order_request.table_number,
        total_price=total_price,
        subtotal=total_price,
        payment_method=order_request.payment_method,
        special_instructions=order_request.special_instructions
    )
    
    db.add(order)
    db.commit()
    db.refresh(order)
    
    # Create order items
    for item_data in order_items_data:
        order_item = OrderItem(
            order_id=order.id,
            **item_data
        )
        db.add(order_item)
    
    db.commit()
    db.refresh(order)
    
    return {
        "id": order.id,
        "order_number": order.order_number,
        "table_number": order.table_number,
        "status": order.status.value,
        "total_price": float(order.total_price),
        "message": "Order placed successfully"
    }

@router.get("/kitchen/orders")
def get_kitchen_orders(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get orders for kitchen view"""
    
    query = db.query(Order)
    
    if status:
        query = query.filter(Order.status == status)
    else:
        # Show active orders by default
        query = query.filter(Order.status.in_([
            OrderStatus.PENDING, OrderStatus.CONFIRMED, 
            OrderStatus.PREPARING, OrderStatus.READY
        ]))
    
    orders = query.order_by(Order.created_at).all()
    
    result = []
    for order in orders:
        customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
        
        order_data = {
            "id": order.id,
            "order_number": order.order_number,
            "table_number": order.table_number,
            "customer_name": customer.name if customer else "Unknown",
            "status": order.status.value if hasattr(order.status, 'value') else str(order.status),
            "total_price": float(order.total_price),
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "items": []
        }
        
        # Get order items
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        for item in items:
            menu_item = db.query(MenuItem).filter(MenuItem.id == item.menu_item_id).first()
            if menu_item:
                order_data["items"].append({
                    "id": item.id,
                    "name": menu_item.name,
                    "quantity": item.quantity,
                    "price": float(item.price),
                    "subtotal": float(item.subtotal)
                })
        
        result.append(order_data)
    
    return result

@router.put("/kitchen/orders/{order_id}")
def update_order_status_route(
    order_id: int, 
    status: str, 
    db: Session = Depends(get_db)
):
    """Update order status"""
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    try:
        new_status = OrderStatus(status.lower())
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
    
    order.status = new_status
    db.commit()
    
    return {
        "message": f"Order {order.order_number} marked as {status}",
        "order_id": order.id,
        "status": order.status.value
    }

@router.get("/orders/{order_id}")
def get_order_details(order_id: int, db: Session = Depends(get_db)):
    """Get order details"""
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    
    item_list = []
    for item in items:
        menu_item = db.query(MenuItem).filter(MenuItem.id == item.menu_item_id).first()
        if menu_item:
            item_list.append({
                "id": item.id,
                "name": menu_item.name,
                "quantity": item.quantity,
                "price": float(item.price),
                "subtotal": float(item.subtotal),
                "special_instructions": item.special_instructions
            })
    
    return {
        "id": order.id,
        "order_number": order.order_number,
        "table_number": order.table_number,
        "customer_name": customer.name if customer else None,
        "phone": customer.phone_number if customer else None,
        "email": customer.email if customer else None,
        "status": order.status.value,
        "payment_method": order.payment_method.value if order.payment_method else None,
        "total": float(order.total_price),
        "subtotal": float(order.subtotal) if order.subtotal else 0,
        "special_instructions": order.special_instructions,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "items": item_list
    }

@router.get("/reports/today-sales")
def today_sales(
    db: Session = Depends(get_db)
):
    """Get today's sales report"""
    
    today = date.today()
    
    orders_query = db.query(Order).filter(
        func.date(Order.created_at) == today
    )
    
    total_sales = orders_query.with_entities(
        func.sum(Order.total_price)
    ).scalar() or 0
    
    total_orders = orders_query.count()
    
    paid_orders = orders_query.filter(Order.payment_status == 'paid').count()
    
    return {
        "date": str(today),
        "today_revenue": float(total_sales),
        "total_orders": total_orders,
        "paid_orders": paid_orders
    }
