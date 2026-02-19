from app.core.security import hash_pin
from app.core.security import verify_password, create_access_token
from app.core.dependencies import get_current_admin

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.db.database import get_db
from app.models.menu import MenuItem
from app.models.staff import Staff
from app.models.order import Order
from app.schemas.menu import MenuCreate, MenuResponse, MenuUpdate
from app.core.config import get_settings
from sqlalchemy.exc import IntegrityError
from app.schemas.staff import StaffResponse



router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)
settings = get_settings()

# --- REQUEST SCHEMAS ---
class LoginRequest(BaseModel):
    phone_number: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class StaffCreate(BaseModel):
    name: str
    phone: str
    pin: str
    role: str


# ==============================
# 1. ADMIN LOGIN
# ==============================
@router.post("/login", response_model=LoginResponse)
def admin_login(request: LoginRequest, db: Session = Depends(get_db)):

    staff = db.query(Staff).filter(Staff.phone == request.phone_number).first()

    if not staff:
        raise HTTPException(status_code=401, detail="Invalid phone or PIN")

    if not verify_password(request.password, staff.pin):
        raise HTTPException(status_code=401, detail="Invalid phone or PIN")

    access_token = create_access_token(
        data={
            "sub": staff.phone,
            "role": staff.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "name": staff.name,
            "role": staff.role
        }
    }

# ==============================
# CREATE MENU ITEM
# ==============================
@router.post("/menu", response_model=MenuResponse)
def create_menu_item(
    item: MenuCreate,
    db: Session = Depends(get_db)
):
    """Create new menu item"""
    
    menu_item = MenuItem(**item.model_dump())
    db.add(menu_item)
    db.commit()
    db.refresh(menu_item)
    
    return menu_item

# ==============================
# UPDATE MENU ITEM
# ==============================
@router.put("/menu/{item_id}", response_model=MenuResponse)
def update_menu_item(
    item_id: int,
    item_update: MenuUpdate,
    db: Session = Depends(get_db)
):
    """Update menu item"""
    
    menu_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    update_data = item_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(menu_item, field, value)
    
    db.commit()
    db.refresh(menu_item)
    
    return menu_item

# ==============================
# DELETE MENU ITEM
# ==============================
@router.delete("/menu/{item_id}")
def delete_menu_item(
    item_id: int,
    db: Session = Depends(get_db)
):
    """Delete menu item"""
    
    menu_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    db.delete(menu_item)
    db.commit()
    
    return {"message": "Menu item deleted successfully"}

# ==============================
# VIEW ALL MENU ITEMS
# ==============================
@router.get("/menu", response_model=list[MenuResponse])
def get_all_menu_items(
    db: Session = Depends(get_db)
):
    """Get all menu items for admin (including unavailable ones)"""
    
    menu_items = db.query(MenuItem).all()
    return menu_items

# ==============================
# VIEW ORDERS
# ==============================
@router.get("/orders")
def view_orders(
    db: Session = Depends(get_db)
):
    """View all orders"""
    
    orders = db.query(Order).all()
    return orders

# ==============================
# CREATE STAFF
# ==============================
@router.post("/staff")
def create_staff(
    staff: StaffCreate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):

    existing_user = db.query(Staff).filter(Staff.phone == staff.phone).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Phone already exists")

    hashed_pin = hash_pin(staff.pin)

    new_staff = Staff(
        name=staff.name,
        phone=staff.phone,
        pin=hashed_pin,
        role=staff.role,
        is_active=True
    )

    db.add(new_staff)
    db.commit()
    db.refresh(new_staff)

    return {
        "message": "Staff created successfully",
        "id": new_staff.id
    }
 
@router.get("/staff", response_model=list[StaffResponse])
def get_all_staff(
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    return db.query(Staff).all()

    

@router.put("/staff/{staff_id}/deactivate")
def deactivate_staff(
    staff_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """Deactivate a staff member"""
    
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    staff.is_active = False
    db.commit()
    
    return {"message": "Staff deactivated successfully"}