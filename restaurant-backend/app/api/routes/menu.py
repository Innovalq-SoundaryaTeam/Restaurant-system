from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.menu import MenuItem
from app.schemas.menu import MenuCreate
from fastapi import HTTPException


router = APIRouter()


@router.post("/menu")
def create_menu(item: MenuCreate, db: Session = Depends(get_db)):

    new_item = MenuItem(**item.model_dump())

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item


@router.get("/menu")
def get_menu(db: Session = Depends(get_db)):

    return db.query(MenuItem).filter(
        MenuItem.is_available == True
    ).all()


@router.put("/menu/{item_id}/availability")
def update_availability(item_id: int, available: bool, db: Session = Depends(get_db)):

    item = db.query(MenuItem).filter(
        MenuItem.id == item_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item.is_available = available
    db.commit()

    return {
        "message": f"{item.name} availability updated to {available}"
    }
