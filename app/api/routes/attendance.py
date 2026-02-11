from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import pandas as pd
import io
from typing import List

# Import your database tool
try:
    from app.db.database import get_db
except ImportError:
    from app.api.dependencies.database import get_db

from app.models.attendance import Attendance
from app.schemas.attendance import AttendanceCreate, AttendanceResponse

router = APIRouter()

# 1. GET: Fetch all records
@router.get("/", response_model=List[AttendanceResponse])
def read_attendance(db: Session = Depends(get_db)):
    return db.query(Attendance).order_by(Attendance.id.desc()).all()

# --- THE EXPORT ROUTE ---
@router.get("/export")
def export_attendance(db: Session = Depends(get_db)):
    try:
        records = db.query(Attendance).all()
        data = [{"ID": r.id, "Name": r.name, "Status": r.status, "Date": r.date_time} for r in records]
        
        df = pd.DataFrame(data)
        stream = io.BytesIO()
        # Use xlsxwriter to create the file
        with pd.ExcelWriter(stream, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False, sheet_name='Sheet1')
        
        stream.seek(0)
        return StreamingResponse(
            stream,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=Staff_Attendance.xlsx"}
        )
    except Exception as e:
        print(f"Export Error: {e}")
        raise HTTPException(status_code=500, detail="Excel generation failed")

# 2. POST: Add record with DUPLICATE CHECK
@router.post("/", response_model=AttendanceResponse)
def create_attendance(item: AttendanceCreate, db: Session = Depends(get_db)):
    # Duplicate Check logic
    today_date = item.date_time.split(' ')[0] 
    existing = db.query(Attendance).filter(
        Attendance.name == item.name,
        Attendance.date_time.contains(today_date)
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already marked for today!")

    new_record = Attendance(name=item.name, status=item.status, date_time=item.date_time)
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

# 3. DELETE: Remove a record
@router.delete("/{record_id}")
def delete_attendance(record_id: int, db: Session = Depends(get_db)):
    record = db.query(Attendance).filter(Attendance.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()
    return {"message": "Deleted successfully"}

# 4. PUT: Update a record (Edit)
@router.put("/{record_id}", response_model=AttendanceResponse)
def update_attendance(record_id: int, item: AttendanceCreate, db: Session = Depends(get_db)):
    record = db.query(Attendance).filter(Attendance.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    record.name = item.name
    record.status = item.status
    record.date_time = item.date_time
    
    db.commit()
    db.refresh(record)
    return record