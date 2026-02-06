from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse

import pandas as pd

from app.db.database import get_db
from app.models.customer import Customer


router = APIRouter(prefix="/admin", tags=["Admin Customers"])


# ✅ View all customers in dashboard
@router.get("/customers")
def get_all_customers(db: Session = Depends(get_db)):

    customers = db.query(Customer).order_by(Customer.id.desc()).all()

    return customers


# ✅ Export customers to Excel
@router.get("/customers/export")
def export_customers(db: Session = Depends(get_db)):

    customers = db.query(Customer).order_by(Customer.created_at.desc()).all()


    data = [
        {
            "Customer ID": c.id,
            "Customer Name": c.name,
            "Phone": c.phone_number,
            "Email id": c.email,
        }
        for c in customers
    ]

    df = pd.DataFrame(data)

    file_path = "customers.xlsx"
    df.to_excel(file_path, index=False)

    return FileResponse(
        path=file_path,
        filename="customers.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
