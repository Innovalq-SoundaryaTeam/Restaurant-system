import os
from urllib.parse import urlparse
from functools import lru_cache
from dotenv import load_dotenv
from pydantic import BaseModel

# Load environment variables at startup
load_dotenv()


class ConfigurationError(Exception):
    """Custom exception for configuration errors"""
    pass


def validate_database_url():
    """Validate and return DATABASE_URL with startup printing"""
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        print("ERROR: DATABASE_URL not found in environment variables!")
        print("Please check your .env file and ensure DATABASE_URL is set.")
        raise ConfigurationError("DATABASE_URL not found in environment variables")

    try:
        parsed = urlparse(database_url)

        if not parsed.scheme or not parsed.netloc or not parsed.path.lstrip('/'):
            raise ValueError("Invalid URL structure")

        # Mask password when printing
        safe_url = database_url
        if '@' in database_url:
            parts = database_url.split('@')
            user_pass = parts[0].split('://')
            if ':' in user_pass[1]:
                user = user_pass[1].split(':')[0]
                safe_url = f"{user_pass[0]}://{user}:***@{parts[1]}"

        print(f"Database URL loaded: {safe_url}")
        print(f"   Host: {parsed.hostname}")
        print(f"   Port: {parsed.port or 'default'}")
        print(f"   Database: {parsed.path.lstrip('/')}")

        return database_url

    except Exception as e:
        print(f"ERROR: Invalid DATABASE_URL format: {e}")
        print("Expected format: mysql+pymysql://username:password@hostname/database_name")
        raise ConfigurationError(f"Invalid DATABASE_URL format: {e}")


# Validate DATABASE_URL at startup
DATABASE_URL = validate_database_url()

# Other environment variables
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

GMAIL_EMAIL = os.getenv("GMAIL_EMAIL")
GMAIL_PASSWORD = os.getenv("GMAIL_PASSWORD")
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
ACCESS_TOKEN_EXPIRE_HOURS: int = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", 24)
)

print("Configuration loaded successfully")
print(f"   SMTP Server: {SMTP_SERVER}:{SMTP_PORT}")
print(f"   Admin Email: {ADMIN_EMAIL or 'Not set'}")


# ==========================
# FastAPI Settings Provider
# ==========================

class Settings(BaseModel):
    """FastAPI settings object for dependency injection"""
    DATABASE_URL: str = DATABASE_URL
    SECRET_KEY: str = SECRET_KEY
    ALGORITHM: str = ALGORITHM
    SMTP_SERVER: str = SMTP_SERVER
    SMTP_PORT: int = SMTP_PORT
    ADMIN_EMAIL: str | None = ADMIN_EMAIL
    ACCESS_TOKEN_EXPIRE_HOURS: int = ACCESS_TOKEN_EXPIRE_HOURS



@lru_cache()
def get_settings():
    settings = Settings()

    print("Configuration loaded successfully")
    print(f"   SMTP Server: {settings.SMTP_SERVER}:{settings.SMTP_PORT}")
    print(f"   Admin Email: {settings.ADMIN_EMAIL or 'Not set'}")

    return settings


# 🔥 VERY IMPORTANT — DO NOT DELETE
settings = get_settings()

