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
    role: str
    pin: str

# ==============================
# 1. ADMIN LOGIN
# ==============================
@router.post("/login", response_model=LoginResponse)
def admin_login(request: LoginRequest, db: Session = Depends(get_db)):
    """Admin login endpoint"""
    
    # Find staff by phone number
    staff = db.query(Staff).filter(Staff.phone == request.phone_number).first()
    
    # For demo purposes, use simple password check
    # In production, use proper password hashing
    if not staff or request.password != "admin123":  # Temporary simple check
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone number or password"
        )
    
    # Create demo token (in production, use JWT)
    return {
        "access_token": "demo_token",
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
    staff_data: StaffCreate,
    db: Session = Depends(get_db)
):
    """Create new staff member"""
    
    # Simple password hashing for demo
    hashed_pin = f"hashed_{staff_data.pin}"  # In production, use proper hashing
    
    staff = Staff(
        name=staff_data.name,
        phone=staff_data.phone,
        role=staff_data.role,
        pin=hashed_pin
    )
    db.add(staff)
    db.commit()
    
    return {"message": "Staff created successfully"}
