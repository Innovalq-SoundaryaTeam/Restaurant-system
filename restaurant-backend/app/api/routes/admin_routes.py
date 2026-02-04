from fastapi import APIRouter, Depends, HTTPException,UploadFile, File
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.menu import MenuItem
from app.models.staff import Staff
from app.models.order import Order
from app.core.security import hash_pin
from app.api.dependencies.admin_guard import admin_required

import shutil
import os


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

# ==============================
# CREATE MENU ITEM
# ==============================

@router.post("/menu")
def create_menu_item(
    name: str,
    price: float,
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):

    item = MenuItem(
        name=name,
        price=price,
        is_available=True
    )

    db.add(item)
    db.commit()

    return {"message": "Menu item created"}

# ==============================
# update MENU ITEM
# ==============================

@router.put("/menu/{item_id}")
def update_menu_item(
    item_id: int,
    name: str = None,
    price: float = None,
    is_available: bool = None,
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):

    item = db.query(MenuItem).filter(
        MenuItem.id == item_id
    ).first()

    if not item:
        raise HTTPException(404, "Item not found")

    if name is not None:
        item.name = name

    if price is not None:
        item.price = price

    if is_available is not None:
        item.is_available = is_available

    db.commit()

    return {"message": "Menu updated"}


# ==============================
# DISABLE MENU ITEM
# ==============================

@router.put("/menu/{item_id}/disable")
def disable_menu_item(
    item_id: int,
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):

    item = db.query(MenuItem).filter(
        MenuItem.id == item_id
    ).first()

    if not item:
        raise HTTPException(404, "Item not found")

    item.is_available = False
    db.commit()

    return {"message": "Item disabled"}


# ==============================
# VIEW ALL ORDERS
# ==============================

@router.get("/orders")
def view_orders(
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):

    orders = db.query(Order).all()

    return orders


# ==============================
# CREATE STAFF
# ==============================

@router.post("/staff")
def create_staff(
    name: str,
    phone: str,
    role: str,
    pin: str,
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):

    staff = Staff(
        name=name,
        phone=phone,
        role=role,
        pin=hash_pin(pin)  # 🔥 HASHED
    )

    db.add(staff)
    db.commit()

    return {"message": "Staff created"}

@router.post("/menu/{item_id}/upload-image")
def upload_menu_image(
    item_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):

    item = db.query(MenuItem).filter(
        MenuItem.id == item_id
    ).first()

    if not item:
        raise HTTPException(404, "Menu item not found")

    # create unique filename
    file_path = f"static/images/{item_id}_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # save path to DB
    item.image_url = file_path
    db.commit()

    return {
        "message": "Image uploaded",
        "image_url": file_path
    }

