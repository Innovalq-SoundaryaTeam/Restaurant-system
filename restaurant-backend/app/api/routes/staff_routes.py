from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.staff import Staff
from app.core.security import verify_pin, create_access_token


router = APIRouter(prefix="/staff", tags=["Staff"])


# ===============================
# LOGIN
# ===============================
@router.post("/login")
def staff_login(phone: str, pin: str, db: Session = Depends(get_db)):

    staff = db.query(Staff).filter(
        Staff.phone == phone
    ).first()

    if not staff:
        raise HTTPException(404, "Staff not found")

    if not verify_pin(pin, staff.pin):
        raise HTTPException(401, "Invalid PIN")

    token = create_access_token({
        "staff_id": staff.id,
        "role": staff.role
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": staff.role,
        "name": staff.name
    }
