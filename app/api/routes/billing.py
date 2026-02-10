from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.order import Order, OrderItem
from app.models.customer import Customer
from app.models.menu import MenuItem
from app.services.email_service import email_service
from app.services.pdf_service import pdf_service



import os
from datetime import datetime

router = APIRouter()

@router.post("/billing/send-email/{order_id}")
def send_bill_email(
    order_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Send bill email with PDF attachment"""
    
    # Get order details
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Get customer details
    customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get order items
    order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    
    items_list = []
    for item in order_items:
        menu_item = db.query(MenuItem).filter(MenuItem.id == item.menu_item_id).first()
        if menu_item:
            items_list.append({
                "name": menu_item.name,
                "quantity": item.quantity,
                "price": item.price
            })
    
    order_details = {
        "order_number": order.order_number,
        "table_number": order.table_number,
        "total_amount": order.total_price,
        "payment_method": order.payment_method,
        "items": items_list
    }
    
    customer_info = {
        "name": customer.name,
        "phone": customer.phone_number,
        "email": customer.email
    }
    
    # Generate PDF
    try:
        pdf_path = pdf_service.generate_bill_pdf(order_details, customer_info)
        
        # Send email in background
        background_tasks.add_task(
            email_service.send_bill_email,
            customer.email,
            customer.name,
            order_details,
            pdf_path
        )
        
        return {
            "message": "Bill is being sent to your email",
            "email": customer.email,
            "order_number": order.order_number
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate bill: {str(e)}")

@router.get("/billing/download/{order_id}")
def download_bill_pdf(order_id: int, db: Session = Depends(get_db)):
    """Generate and return bill PDF for download"""
    
    # Get order details
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Get customer details
    customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get order items
    order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    
    items_list = []
    for item in order_items:
        menu_item = db.query(MenuItem).filter(MenuItem.id == item.menu_item_id).first()
        if menu_item:
            items_list.append({
                "name": menu_item.name,
                "quantity": item.quantity,
                "price": item.price
            })
    
    order_details = {
        "order_number": order.order_number,
        "table_number": order.table_number,
        "total_amount": order.total_price,
        "payment_method": order.payment_method,
        "items": items_list
    }
    
    customer_info = {
        "name": customer.name,
        "phone": customer.phone_number,
        "email": customer.email
    }
    
    # Generate PDF
    try:
        pdf_path = pdf_service.generate_bill_pdf(order_details, customer_info)
        
        return {
            "message": "PDF generated successfully",
            "download_url": f"/api/billing/file/{os.path.basename(pdf_path)}",
            "filename": f"bill_{order.order_number}.pdf"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

@router.post("/billing/place-order-with-email")
def place_order_with_email(
    order_data: dict,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Place order and automatically send bill email"""
    
    try:
        # Extract customer info
        customer_info = order_data.get("customer", {})
        name = customer_info.get("name")
        phone = customer_info.get("phone")
        email = customer_info.get("email")
        
        if not all([name, phone, email]):
            raise HTTPException(status_code=400, detail="Customer name, phone, and email are required")
        
        # Create or get customer
        customer = db.query(Customer).filter(Customer.phone_number == phone).first()
        if not customer:
            customer = Customer(
                name=name,
                phone_number=phone,
                email=email
            )
            db.add(customer)
            db.commit()
            db.refresh(customer)
        else:
            # Update customer info if needed
            customer.name = name
            customer.email = email
            db.commit()
        
        # Create order (using existing order service logic)
        from app.services.order_service import create_order
        
        order = create_order(
            db=db,
            table_number=order_data.get("table_number"),
            phone_number=phone,
            items=order_data.get("items", [])
        )
        
        # Get order items for email
        order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        items_list = []
        for item in order_items:
            menu_item = db.query(MenuItem).filter(MenuItem.id == item.menu_item_id).first()
            if menu_item:
                items_list.append({
                    "name": menu_item.name,
                    "quantity": item.quantity,
                    "price": item.price
                })
        
        order_details = {
            "order_number": order.order_number,
            "table_number": order.table_number,
            "total_amount": order.total_price,
            "payment_method": order_data.get("payment_method", "UPI"),
            "items": items_list
        }
        
        customer_info = {
            "name": customer.name,
            "phone": customer.phone_number,
            "email": customer.email
        }
        
        # Generate PDF and send email in background
        pdf_path = pdf_service.generate_bill_pdf(order_details, customer_info)
        background_tasks.add_task(
            email_service.send_bill_email,
            customer.email,
            customer.name,
            order_details,
            pdf_path
        )
        
        return {
            "message": "Order placed successfully! Bill will be sent to your email.",
            "order_id": order.id,
            "order_number": order.order_number,
            "total": order.total_price,
            "email": customer.email
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to place order: {str(e)}")
