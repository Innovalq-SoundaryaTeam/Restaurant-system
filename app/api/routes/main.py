from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ✅ Import routers
from app.api.routes import orders, menu, billing, websocket

app = FastAPI(
    title="Restaurant Backend API",
    version="1.0.0"
)

# -------------------------------------------------
# ✅ CORS CONFIG (THIS FIXES YOUR ERROR)
# -------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# ✅ ROUTERS
# -------------------------------------------------
app.include_router(menu.router, prefix="/api", tags=["Menu"])
app.include_router(orders.router, prefix="/api", tags=["Orders"])
app.include_router(billing.router, prefix="/api", tags=["Billing"])
app.include_router(websocket.router, prefix="/api", tags=["WebSocket"])

# -------------------------------------------------
# ✅ ROOT CHECK
# -------------------------------------------------
@app.get("/")
def root():
    return {"status": "Restaurant API running"}
