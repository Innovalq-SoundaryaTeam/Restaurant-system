from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from uuid import uuid4

router = APIRouter()

# Temporary in-memory storage
staff_db = []

class Staff(BaseModel):
    id: str = None
    name: str
    address: str
    phone: str
    aadhar: str
    role: str


@router.post("/add-staff")
def add_staff(staff: Staff):
    staff.id = str(uuid4())
    staff_db.append(staff)
    return {"message": "Staff added successfully", "data": staff}


@router.get("/get-staff", response_model=List[Staff])
def get_staff():
    return staff_db


@router.delete("/delete-staff/{staff_id}")
def delete_staff(staff_id: str):
    global staff_db
    staff_db = [s for s in staff_db if s.id != staff_id]
    return {"message": "Staff deleted successfully"}