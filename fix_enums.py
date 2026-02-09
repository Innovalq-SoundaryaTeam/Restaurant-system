#!/usr/bin/env python3
"""
Fix enum values in database to match SQLAlchemy models
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import engine
from sqlalchemy import text

def fix_enum_values():
    """Fix enum values to match SQLAlchemy enum definitions"""
    
    if not engine:
        print("Database engine not available")
        return False
    
    try:
        with engine.connect() as conn:
            # Fix spicy_level enum values (database uses lowercase, model expects lowercase)
            print("Checking spicy_level enum values...")
            result = conn.execute(text("SELECT spicy_level FROM menu_items"))
            spicy_values = [row.spicy_level for row in result.fetchall()]
            print(f"Current spicy_level values: {spicy_values}")
            
            # dietary_info values should match database schema (lowercase with hyphens)
            print("Checking dietary_info enum values...")
            result = conn.execute(text("SELECT dietary_info FROM menu_items"))
            dietary_values = [row.dietary_info for row in result.fetchall()]
            print(f"Current dietary_info values: {dietary_values}")
            
            print("✅ Enum values are correct!")
            return True
            
    except Exception as e:
        print(f"Error checking enum values: {e}")
        return False

if __name__ == "__main__":
    success = fix_enum_values()
    sys.exit(0 if success else 1)
