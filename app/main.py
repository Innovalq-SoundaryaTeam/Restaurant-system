import sys
import os
import logging
from contextlib import asynccontextmanager
from datetime import datetime
from urllib.parse import unquote, urlparse

from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from twilio.rest import Client
import mysql.connector
from dotenv import load_dotenv
from app.schemas import staff



# --------------------------------------------------
# Logging
# --------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --------------------------------------------------
# Load Environment Variables
# --------------------------------------------------
load_dotenv()

# --------------------------------------------------
# Safe Imports for Database & Config
# --------------------------------------------------
try:
    from app.core.config import DATABASE_URL
    from app.db.database import Base, engine, test_database_connection
except Exception as e:
    logger.error(f"Initialization Error: {e}")
    Base = engine = None
    DATABASE_URL = os.getenv("DATABASE_URL")

# --------------------------------------------------
# Import API Routers & Models
# --------------------------------------------------
from app.models import menu, order, table, customer
from app.api.routes import (
    menu as menu_routes,
    orders as order_routes,
    tables as table_routes,
    admin as admin_routes,
    billing as billing_routes,
    kitchen as kitchen_routes,
    attendance
)
from app.services.websocket_service import websocket_manager

# --------------------------------------------------
# Database Helper
# --------------------------------------------------
def get_db_connection():
    try:
        url = os.getenv("DATABASE_URL")
        if not url:
            raise ValueError("DATABASE_URL missing")

        if url.startswith("mysql+pymysql://"):
            url = url.replace("mysql+pymysql://", "mysql://")

        parsed = urlparse(url)

        connection = mysql.connector.connect(
            host=parsed.hostname or "localhost",
            user=parsed.username,
            password=unquote(parsed.password or ""),
            database=parsed.path.lstrip('/')
        )
        return connection

    except Exception as e:
        logger.error(f"Connection Failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"DB Error: {str(e)}")

def create_tables():
    if engine and Base:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified")

# --------------------------------------------------
# App Lifespan
# --------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting Restaurant Backend API")
    if test_database_connection and test_database_connection():
        create_tables()
    yield
    if engine:
        engine.dispose()
        print("Database connections closed")

# --------------------------------------------------
# FastAPI App
# --------------------------------------------------
app = FastAPI(
    title="Restaurant Management API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# Register Routers
# --------------------------------------------------
app.include_router(menu_routes.router, prefix="/api", tags=["Menu"])
app.include_router(order_routes.router, prefix="/api", tags=["Orders"])
app.include_router(table_routes.router, prefix="/api", tags=["Tables"])
app.include_router(admin_routes.router, prefix="/api", tags=["Admin"])
app.include_router(billing_routes.router, prefix="/api", tags=["Billing"])
app.include_router(kitchen_routes.router, prefix="/api", tags=["Kitchen"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["Attendance"])
app.include_router(staff.router,prefix="/staff",tags=["staff"])

# --------------------------------------------------
# WebSocket
# --------------------------------------------------
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except:
        websocket_manager.disconnect(websocket)

@app.get("/")
def root():
    return {"message": "Restaurant Backend Running 🔥", "docs": "/docs"}

# --------------------------------------------------
# Twilio Config
# --------------------------------------------------
TWILIO_SID = os.getenv("TWILIO_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER")

def get_twilio_client():
    if not TWILIO_SID or not TWILIO_AUTH_TOKEN:
        raise HTTPException(status_code=500, detail="Twilio not configured")
    return Client(TWILIO_SID, TWILIO_AUTH_TOKEN)

# --------------------------------------------------
# WhatsApp Message Formatter
# --------------------------------------------------
def format_whatsapp_message(customer_name, order_id, items, total_amount):
    message = (
        f"🍽️ *RESTAURANT BILL*\n\n"
        f"👤 Customer: {customer_name}\n"
        f"🧾 Order ID: #{order_id}\n"
        f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n"
        f"📋 *Items:*\n"
    )

    for item in items:
        name = item.get("item_name") or item.get("name")
        line_total = float(item["price"]) * int(item["quantity"])
        message += f"• {name} x{item['quantity']} - ₹{line_total:.2f}\n"

    message += f"\n💰 *Total Amount: ₹{total_amount:.2f}*\n\nThank you for dining with us! 🙏"
    return message

# --------------------------------------------------
# Generate Bill & Send WhatsApp
# --------------------------------------------------
@app.post("/api/generate-bill/{order_id}")
def generate_bill(order_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Fetch order + customer
        cursor.execute("""
            SELECT 
                o.id, 
                o.total_price, 
                c.name AS customer_name, 
                c.phone_number AS customer_phone
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            WHERE o.id = %s
        """, (order_id,))
        order_data = cursor.fetchone()

        if not order_data:
            raise HTTPException(status_code=404, detail="Order not found")

        # Fetch items
        cursor.execute("""
            SELECT 
                m.name, 
                oi.quantity, 
                oi.price 
            FROM order_items oi
            JOIN menu_items m ON oi.menu_item_id = m.id
            WHERE oi.order_id = %s
        """, (order_id,))
        items = cursor.fetchall()

        # Format message
        msg_body = format_whatsapp_message(
            order_data["customer_name"],
            order_data["id"],
            items,
            order_data["total_price"]
        )

        # ✅ FIXED PHONE FORMAT HERE
        phone_number = str(order_data["customer_phone"]).strip()

        if phone_number.startswith("0"):
            phone_number = "+91" + phone_number[1:]
        elif not phone_number.startswith("+"):
            phone_number = "+91" + phone_number

        client = get_twilio_client()

        client.messages.create(
            body=msg_body,
            from_=TWILIO_WHATSAPP_NUMBER,
            to=f"whatsapp:{phone_number}"
        )

        cursor.execute(
            "UPDATE orders SET status = 'CONFIRMED' WHERE id = %s",
            (order_id,)
        )
        connection.commit()

        return {"status": "success", "message": "WhatsApp bill sent successfully!"}

    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        connection.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
