from app.db.database import SessionLocal
from app.models.staff import Staff
from app.core.security import hash_pin

db = SessionLocal()

admin = Staff(
    name="Admin",
    phone="9999999999",
    pin=hash_pin("1234"),   # You can change later
    role="ADMIN"
)

db.add(admin)
db.commit()

print("Admin created successfully!")
