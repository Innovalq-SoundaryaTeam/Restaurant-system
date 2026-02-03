from fastapi import FastAPI
from app.db.database import Base, engine

from app.models import menu, order,table,customer
from app.api.routes import menu as menu_routes
from app.api.routes import orders as order_routes
from app.api.routes import tables as table_routes
from app.api.routes import customers as customer_routes



Base.metadata.create_all(bind=engine)

app = FastAPI(title="Restaurant Management API")


app.include_router(menu_routes.router)
app.include_router(order_routes.router)
app.include_router(table_routes.router)
app.include_router(customer_routes.router)




@app.get("/")
def root():
    return {"message": "Restaurant Backend Running 🔥"}
