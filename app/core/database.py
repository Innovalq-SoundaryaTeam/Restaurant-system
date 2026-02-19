from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings


engine = create_engine(
    settings.DATABASE_URL,

    pool_pre_ping=True,   # prevents MySQL timeout crashes
    pool_recycle=3600     # reconnect every hour
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()
