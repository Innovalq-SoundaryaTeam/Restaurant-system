from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from app.db.database import get_db
from app.models.order import Order, OrderItem
from app.models.customer import Customer
from app.models.menu import MenuItem

import qrcode
from datetime import datetime
import os


router = APIRouter(prefix="/customer", tags=["Customer Billing"])


@router.get("/invoice/{order_id}")
def download_customer_invoice(order_id: int, db: Session = Depends(get_db)):

    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # 🔐 Only allow after payment
    if order.status != "paid":
        raise HTTPException(
            status_code=403,
            detail="Invoice available only after payment"
        )

    customer = db.query(Customer).filter(
        Customer.id == order.customer_id
    ).first()

    items = db.query(OrderItem).filter(
        OrderItem.order_id == order.id
    ).all()

    file_name = f"Invoice_{order.order_number}.pdf"
    qr_file = f"qr_{order.order_number}.png"

    # ⭐ Generate QR Data
    qr_data = f"""
    Order: {order.order_number}
    Customer: {customer.name}
    Amount Paid: ₹{order.total_price}
    Payment Method: {order.payment_method}
    Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}
    """

    qr_img = qrcode.make(qr_data)
    qr_img.save(qr_file)

    # ⭐ Create PDF
    c = canvas.Canvas(file_name, pagesize=letter)
    width, height = letter

    y = height - 50

    # ⭐ Header
    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, y, "YOUR RESTAURANT NAME")

    y -= 40
    c.setFont("Helvetica", 11)

    c.drawString(50, y, f"Order Number: {order.order_number}")
    y -= 20

    c.drawString(50, y, f"Customer: {customer.name}")
    y -= 20

    c.drawString(50, y, f"Phone: {customer.phone_number}")
    y -= 20

    c.drawString(50, y, f"Payment: {order.payment_method}")
    y -= 20

    c.drawString(50, y, f"Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}")

    # ⭐ Table Header
    y -= 40
    c.setFont("Helvetica-Bold", 12)

    c.drawString(50, y, "Item")
    c.drawString(250, y, "Qty")
    c.drawString(320, y, "Price")

    y -= 10
    c.line(50, y, 500, y)

    total = 0

    # ⭐ Items
    for item in items:

        menu_item = db.query(MenuItem).filter(
            MenuItem.id == item.menu_item_id
        ).first()

        y -= 20
        c.setFont("Helvetica", 10)

        c.drawString(50, y, menu_item.name)
        c.drawString(250, y, str(item.quantity))
        c.drawString(320, y, f"₹{item.price}")

        total += item.price

    # ⭐ Tax Calculation
    tax = round(total * 0.05, 2)
    grand_total = round(total + tax, 2)

    y -= 40
    c.line(50, y, 500, y)

    y -= 20
    c.drawString(320, y, f"Subtotal: ₹{total}")

    y -= 20
    c.drawString(320, y, f"Tax (5%): ₹{tax}")

    y -= 20
    c.setFont("Helvetica-Bold", 12)
    c.drawString(320, y, f"Total Paid: ₹{grand_total}")

    # ⭐ Add QR Code to PDF
    c.drawImage(qr_file, 400, height - 180, width=120, height=120)

    y -= 60
    c.setFont("Helvetica", 10)
    c.drawString(50, y, "Scan QR for payment verification")

    c.save()

    # 🔥 Cleanup QR file after use
    if os.path.exists(qr_file):
        os.remove(qr_file)

    return FileResponse(
        path=file_name,
        filename=file_name,
        media_type="application/pdf"
    )
