from fastapi import FastAPI
from app.db.database import Base, engine

from app.models import menu, order,table,customer
from app.api.routes import menu as menu_routes
from app.api.routes import orders as order_routes
from app.api.routes import tables as table_routes
from app.api.routes import customers as customer_routes
from app.api.routes.admin_routes import router as admin_router
from fastapi.staticfiles import StaticFiles
from app.api.routes.staff_routes import router as staff_router
from app.models.staff import Staff
from app.core.security import hash_pin
from app.db.database import SessionLocal
from app.api.routes.table_routes import router as table_router
from app.api.routes import admin_customers
from app.api.routes import billing_pdf
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI(title="Restaurant Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (good for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(table_router)
app.include_router(admin_router)
app.include_router(admin_customers.router)
app.include_router(billing_pdf.router)


Base.metadata.create_all(bind=engine)

def create_initial_admin():
    db = SessionLocal()

    admin_exists = db.query(Staff).filter(
        Staff.role == "ADMIN"
    ).first()

    if not admin_exists:
        admin = Staff(
            name="Admin",
            phone="9999999999",
            role="ADMIN",
            pin=hash_pin("1234")
        )

        db.add(admin)
        db.commit()

        print("✅ ADMIN CREATED -> phone: 9999999999 | pin: 1234")

    db.close()


create_initial_admin()


app.include_router(menu_routes.router)
app.include_router(order_routes.router)
app.include_router(table_routes.router)
app.include_router(customer_routes.router)
app.include_router(staff_router)
app.mount("/static", StaticFiles(directory="static"), name="static")




@app.get("/")
def root():
    return {"message": "Restaurant Backend Running 🔥"}
