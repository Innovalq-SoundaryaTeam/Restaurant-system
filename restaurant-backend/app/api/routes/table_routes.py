from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.table import Table
from app.api.dependencies.admin_guard import admin_required

router = APIRouter(
    prefix="/tables",
    tags=["Tables"]
)

VALID_STATUSES = ["FREE", "OCCUPIED", "RESERVED", "CLEANING"]


# ===============================
# CREATE TABLE (ADMIN ONLY)
# ===============================
@router.post("/")
def create_table(
    table_number: int,
    capacity: int,
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):

    exists = db.query(Table).filter(
        Table.table_number == table_number
    ).first()

    if exists:
        raise HTTPException(400, "Table already exists")

    table = Table(
        table_number=table_number,
        capacity=capacity,
        status="FREE"
    )

    db.add(table)
    db.commit()

    return {"message": f"Table {table_number} created"}
    

# ===============================
# GET ALL TABLES
# ===============================
@router.get("/")
def get_tables(db: Session = Depends(get_db)):

    tables = db.query(Table).order_by(Table.table_number).all()

    return tables


# ===============================
# UPDATE TABLE STATUS
# ===============================
@router.put("/{table_id}/status")
def update_table_status(
    table_id: int,
    status: str,
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):

    status = status.upper()

    if status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Use {VALID_STATUSES}"
        )

    table = db.query(Table).filter(
        Table.id == table_id
    ).first()

    if not table:
        raise HTTPException(404, "Table not found")

    table.status = status
    db.commit()

    return {"message": f"Table {table.table_number} → {status}"}
