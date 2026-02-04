import pymysql
pymysql.install_as_MySQLdb()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import DATABASE_URL


# ✅ Production-ready engine
engine = create_engine(
    DATABASE_URL,

    # Turn OFF in production (can enable for debugging)
    echo=False,

    # 🔥 Connection Pool Settings
    pool_size=10,          # persistent connections
    max_overflow=20,      # extra temporary connections
    pool_recycle=1800,    # prevents MySQL timeout
    pool_pre_ping=True,   # checks connection before using

    future=True
)


# ✅ Better session configuration
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False
)


Base = declarative_base()


# ✅ FastAPI Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
