from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.core.security import verify_password, create_access_token
from app.models.staff import Staff

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ===============================
# LOGIN
# ===============================

@router.post("/login")
def login(phone: str, pin: str, db: Session = Depends(get_db)):

    user = db.query(Staff).filter(Staff.phone == phone).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid phone or PIN")

    if not verify_password(pin, user.pin):
        raise HTTPException(status_code=401, detail="Invalid phone or PIN")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")

    token = create_access_token(
        data={
            "sub": user.phone,
            "role": user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "name": user.name
    }
