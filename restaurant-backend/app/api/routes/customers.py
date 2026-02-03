from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.customer import Customer
from app.utils.otp import generate_otp

router = APIRouter()


# ✅ SEND OTP
@router.post("/send-otp")
def send_otp(name: str, phone_number: str, db: Session = Depends(get_db)):

    customer = db.query(Customer).filter(
        Customer.phone_number == phone_number
    ).first()

    otp = generate_otp()

    if not customer:
        customer = Customer(
            name=name,
            phone_number=phone_number,
            otp=otp,
            is_verified=0
        )
        db.add(customer)

    else:
        customer.name = name  # update if changed
        customer.otp = otp
        customer.is_verified = 0

    db.commit()

    return {
        "message": "OTP sent successfully",
        "otp": otp
    }



# ✅ VERIFY OTP
@router.post("/verify-otp")
def verify_otp(phone_number: str, otp: str, db: Session = Depends(get_db)):

    customer = db.query(Customer).filter(
        Customer.phone_number == phone_number
    ).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if customer.otp != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    customer.is_verified = 1
    customer.otp = None

    db.commit()

    return {
        "message": "Phone verified successfully",
        "customer_id": customer.id
    }
