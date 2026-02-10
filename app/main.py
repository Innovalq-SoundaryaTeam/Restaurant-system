import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

# --------------------------------------------------
# Load configuration safely
# --------------------------------------------------
try:
    from app.core.config import DATABASE_URL, ConfigurationError
except Exception as e:
    print(f"Configuration Error: {e}")
    DATABASE_URL = None
    ConfigurationError = Exception

# --------------------------------------------------
# Load database safely
# --------------------------------------------------
try:
    from app.db.database import Base, engine, test_database_connection
    from app.db.database import DatabaseConnectionError
except Exception as e:
    print(f"Database Connection Error: {e}")
    Base = None
    engine = None
    test_database_connection = None
    DatabaseConnectionError = Exception

# --------------------------------------------------
# Import models (ensures tables are registered)
# --------------------------------------------------
from app.models import menu, order, table, customer

# --------------------------------------------------
# Import API routers
# --------------------------------------------------
from app.api.routes import menu as menu_routes
from app.api.routes import orders as order_routes
from app.api.routes import tables as table_routes
from app.api.routes import admin as admin_routes
from app.api.routes import billing as billing_routes

# --------------------------------------------------
# Create tables
# --------------------------------------------------
def create_tables():
    if engine is None or Base is None:
        print("❌ Cannot create tables: database not initialized")
        return False

    try:
        print("📦 Creating / verifying database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables ready")
        return True
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False

# --------------------------------------------------
# App lifespan (startup / shutdown)
# --------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n" + "=" * 60)
    print("🚀 Starting Restaurant Backend API")
    print("=" * 60)

    if test_database_connection:
        if test_database_connection():
            print("✅ Database connection successful")
            create_tables()
        else:
            print("❌ Database connection failed")
    else:
        print("⚠️ Database test function not available")

    print("📘 API Docs: http://localhost:8000/docs")
    print("📕 Redoc:   http://localhost:8000/redoc")
    print("=" * 60 + "\n")

    yield

    print("\n🛑 Shutting down API...")
    if engine:
        engine.dispose()
        print("🔒 Database connections closed")

# --------------------------------------------------
# FastAPI app
# --------------------------------------------------
app = FastAPI(
    title="Restaurant Management API",
    description="QR-based Restaurant Ordering System Backend",
    version="1.0.0",
    lifespan=lifespan
)

# --------------------------------------------------
# CORS
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# API Routers (ALL under /api)
# --------------------------------------------------
app.include_router(menu_routes.router, prefix="/api", tags=["Menu"])
app.include_router(order_routes.router, prefix="/api", tags=["Orders"])
app.include_router(table_routes.router, prefix="/api", tags=["Tables"])
app.include_router(admin_routes.router, prefix="/api", tags=["Admin"])
app.include_router(billing_routes.router, prefix="/api", tags=["Billing"])

# --------------------------------------------------
# Root endpoint
# --------------------------------------------------
@app.get("/")
def root():
    return {
        "message": "Restaurant Backend Running 🔥",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# --------------------------------------------------
# Health check
# --------------------------------------------------
@app.get("/health")
def health_check():
    if engine is None:
        return {
            "status": "unhealthy",
            "database": "not_configured"
        }

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }

# --------------------------------------------------
# Local run
# --------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
