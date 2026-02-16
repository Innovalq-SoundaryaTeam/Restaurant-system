from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.table import Table

router = APIRouter()


@router.post("/tables")
def create_table(table_number: int, db: Session = Depends(get_db)):

    table = Table(table_number=table_number)

    db.add(table)
    db.commit()
    db.refresh(table)

    return table


@router.get("/tables")
def get_tables(db: Session = Depends(get_db)):

    return db.query(Table).all()
