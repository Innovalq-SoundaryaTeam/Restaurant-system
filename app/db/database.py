import os
import sys
import time
from urllib.parse import urlparse
import pymysql
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from app.core.config import DATABASE_URL, ConfigurationError

class DatabaseConnectionError(Exception):
    """Custom exception for database connection errors"""
    pass

# Install pymysql as MySQLdb
pymysql.install_as_MySQLdb()

def create_database_engine():
    """Create database engine with retry logic and validation"""
    
    # Validate DATABASE_URL format
    try:
        parsed = urlparse(DATABASE_URL)
        if not all([parsed.scheme, parsed.hostname, parsed.path.lstrip('/')]):
            raise ValueError("Invalid DATABASE_URL format")
    except Exception as e:
        print(f"DATABASE_URL validation failed: {e}")
        print(f"Current DATABASE_URL: {DATABASE_URL}")
        raise DatabaseConnectionError(f"DATABASE_URL validation failed: {e}")
    
    # Engine configuration with connection pooling
    engine_config = {
        "echo": False,  # Set to True for SQL debugging
        "pool_pre_ping": True,  # Validate connections before use
        "pool_recycle": 3600,  # Recycle connections every hour
        "connect_args": {
            "connect_timeout": 10,  # Connection timeout
            "read_timeout": 30,    # Read timeout
            "charset": "utf8mb4"   # Full Unicode support
        }
    }
    
    # Add SSL configuration if needed
    if "localhost" not in DATABASE_URL:
        engine_config["connect_args"]["ssl"] = {"ca": "/etc/ssl/certs/ca-certificates.crt"}
    
    # Create engine with retry logic
    max_retries = 3
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            print(f"Attempting database connection (attempt {attempt + 1}/{max_retries})...")
            
            engine = create_engine(DATABASE_URL, **engine_config)
            
            # Test the connection
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            
            print("Database connection successful!")
            return engine
            
        except OperationalError as e:
            error_msg = str(e).lower()
            
            if "getaddrinfo failed" in error_msg:
                print(f"DNS/Network error: {e}")
                print("   Please check:")
                print("   1. MySQL server is running")
                print("   2. Hostname is correct (localhost/127.0.0.1)")
                print("   3. Network connectivity")
                print("   4. Firewall settings")
                
            elif "access denied" in error_msg:
                print(f"Authentication error: {e}")
                print("   Please check:")
                print("   1. Username and password are correct")
                print("   2. User has permissions for the database")
                print("   3. Database exists")
                
            elif "can't connect" in error_msg or "connection refused" in error_msg:
                print(f"Connection error: {e}")
                print("   Please check:")
                print("   1. MySQL server is running on specified host")
                print("   2. Port is correct (default: 3306)")
                print("   3. MySQL is accepting connections")
                
            else:
                print(f"Database connection failed: {e}")
            
            if attempt < max_retries - 1:
                print(f"   Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
            else:
                print(f"Failed to connect after {max_retries} attempts")
                print(f"   DATABASE_URL: {DATABASE_URL}")
                raise DatabaseConnectionError(f"Failed to connect after {max_retries} attempts")
                
        except Exception as e:
            print(f"Unexpected error creating database engine: {e}")
            if attempt < max_retries - 1:
                print(f"   Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
                retry_delay *= 2
            else:
                raise DatabaseConnectionError(f"Unexpected error: {e}")

# Create engine with validation
try:
    engine = create_database_engine()
except DatabaseConnectionError as e:
    print(f"Database engine creation failed: {e}")
    print("Application will continue but database operations will fail")
    engine = None

# Create session factory only if engine is available
if engine:
    SessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine
    )
else:
    SessionLocal = None

# Base class for models
Base = declarative_base()

def get_db():
    """Database dependency for FastAPI"""
    if SessionLocal is None:
        raise DatabaseConnectionError("Database session not available - check database connection")
    
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        print(f"Database session error: {e}")
        raise
    finally:
        db.close()

def test_database_connection():
    """Test database connection and print diagnostics"""
    if engine is None:
        print("Database engine not available - cannot test connection")
        return False
        
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT VERSION() as version"))
            row = result.fetchone()
            
            print("Database test successful!")
            print(f"   MySQL Version: {row.version}")
            print(f"   Current Database: restaurant_db")
            
            # Test if required tables exist
            tables_result = conn.execute(text("""
                SELECT COUNT(*) as table_count 
                FROM information_schema.tables 
                WHERE table_schema = 'restaurant_db'
            """))
            table_count = tables_result.fetchone().table_count
            print(f"   Tables found: {table_count}")
            
            return True
            
    except Exception as e:
        print(f"Database test failed: {e}")
        return False

# Test connection at startup
if __name__ != "__main__":  # Only test when imported, not when run directly
    test_database_connection()
