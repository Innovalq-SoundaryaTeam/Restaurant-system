from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.models.menu import MenuItem
from app.schemas.menu import MenuCreate, MenuResponse, MenuUpdate

router = APIRouter(
    tags=["Menu"]
)

# ==============================
# CREATE MENU ITEM (ADMIN)
# ==============================
@router.post("/menu", response_model=MenuResponse)
def create_menu(item: MenuCreate, db: Session = Depends(get_db)):
    """Create a new menu item"""
    new_item = MenuItem(**item.model_dump())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item


# ==============================
# GET MENU ITEMS (CUSTOMER)
# ==============================
@router.get("/menu", response_model=List[MenuResponse])
def get_menu(
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db)
):
    """
    Get all available menu items.
    Single-restaurant system (no restaurant_id filter).
    """
    query = db.query(MenuItem).filter(MenuItem.is_available == True)

    if category:
        query = query.filter(MenuItem.category == category)

    return query.order_by(MenuItem.category, MenuItem.name).all()


# ==============================
# GET SINGLE MENU ITEM
# ==============================
@router.get("/menu/{item_id}", response_model=MenuResponse)
def get_menu_item(item_id: int, db: Session = Depends(get_db)):
    """Get a specific menu item"""
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


# ==============================
# UPDATE MENU ITEM
# ==============================
@router.put("/menu/{item_id}", response_model=MenuResponse)
def update_menu_item(
    item_id: int,
    item_update: MenuUpdate,
    db: Session = Depends(get_db)
):
    """Update a menu item"""
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    update_data = item_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


# ==============================
# UPDATE AVAILABILITY
# ==============================
@router.put("/menu/{item_id}/availability")
def update_availability(
    item_id: int,
    available: bool,
    db: Session = Depends(get_db)
):
    """Update menu item availability"""
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item.is_available = available
    db.commit()

    return {
        "message": f"{item.name} availability updated to {available}"
    }


# ==============================
# DELETE MENU ITEM
# ==============================
@router.delete("/menu/{item_id}")
def delete_menu_item(item_id: int, db: Session = Depends(get_db)):
    """Delete a menu item"""
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(item)
    db.commit()

    return {"message": "Menu item deleted successfully"}
