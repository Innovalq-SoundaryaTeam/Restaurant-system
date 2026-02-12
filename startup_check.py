#!/usr/bin/env python3
"""
Startup validation script for Restaurant Backend
Ensures environment is properly loaded before starting the application
"""

import os
import sys
import subprocess
from pathlib import Path

def check_python_version():
    """Check Python version compatibility"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ is required")
        print(f"   Current version: {version.major}.{version.minor}.{version.micro}")
        return False
    print(f"✅ Python version: {version.major}.{version.minor}.{version.micro}")
    return True

def check_required_packages():
    """Check if required packages are installed"""
    required_packages = [
        'fastapi',
        'sqlalchemy',
        'pymysql',
        'python-dotenv',
        'uvicorn'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package} - NOT INSTALLED")
    
    if missing_packages:
        print(f"\n❌ Missing packages: {', '.join(missing_packages)}")
        print("Install with: pip install " + " ".join(missing_packages))
        return False
    
    return True

def check_env_file():
    """Check if .env file exists and is readable"""
    env_path = Path('.env')
    
    if not env_path.exists():
        print("❌ .env file not found!")
        print("Please create .env file with DATABASE_URL and other required variables")
        return False
    
    print(f"✅ .env file found: {env_path.absolute()}")
    
    # Read and validate .env content
    try:
        with open(env_path, 'r') as f:
            content = f.read()
            
        # Check for required variables
        required_vars = ['DATABASE_URL', 'SECRET_KEY']
        missing_vars = []
        
        for var in required_vars:
            if f"{var}=" not in content:
                missing_vars.append(var)
            elif content.count(f"{var}=") > 1:
                print(f"❌ Duplicate {var} found in .env file!")
                return False
        
        if missing_vars:
            print(f"❌ Missing required variables: {', '.join(missing_vars)}")
            return False
            
        print("✅ Required environment variables found")
        return True
        
    except Exception as e:
        print(f"❌ Error reading .env file: {e}")
        return False

def check_mysql_service():
    """Check if MySQL service is running (basic check)"""
    try:
        # Try to connect to MySQL using command line
        result = subprocess.run(
            ['mysql', '--version'], 
            capture_output=True, 
            text=True, 
            timeout=5
        )
        
        if result.returncode == 0:
            print(f"✅ MySQL client available: {result.stdout.strip()}")
            return True
        else:
            print("❌ MySQL client not found")
            return False
            
    except FileNotFoundError:
        print("❌ MySQL client not installed or not in PATH")
        return False
    except subprocess.TimeoutExpired:
        print("❌ MySQL command timed out")
        return False
    except Exception as e:
        print(f"⚠️  Could not verify MySQL service: {e}")
        return True  # Don't fail startup for this check

def clear_env_cache():
    """Clear any cached environment variables"""
    # Remove problematic environment variables
    env_vars_to_clear = [
        'DATABASE_URL',
        'SECRET_KEY',
        'ALGORITHM'
    ]
    
    for var in env_vars_to_clear:
        if var in os.environ:
            del os.environ[var]
            print(f"🗑️  Cleared cached {var}")
    
    # Force reload of .env
    try:
        from dotenv import load_dotenv
        load_dotenv(override=True)
        print("✅ Environment variables reloaded")
        return True
    except ImportError:
        print("❌ python-dotenv not available")
        return False
    except Exception as e:
        print(f"❌ Error reloading environment: {e}")
        return False

def test_database_import():
    """Test importing database configuration"""
    try:
        # Clear imports cache
        modules_to_clear = [
            'app.core.config',
            'app.db.database'
        ]
        
        for module in modules_to_clear:
            if module in sys.modules:
                del sys.modules[module]
        
        # Test imports
        from app.core.config import DATABASE_URL
        print(f"✅ Config module loaded successfully")
        
        from app.db.database import engine
        print(f"✅ Database module loaded successfully")
        
        return True
        
    except Exception as e:
        print(f"❌ Error importing database modules: {e}")
        return False

def main():
    """Run all startup checks"""
    print("🚀 Restaurant Backend - Startup Validation")
    print("=" * 50)
    
    checks = [
        ("Python Version", check_python_version),
        ("Required Packages", check_required_packages),
        ("Environment File", check_env_file),
        ("MySQL Service", check_mysql_service),
        ("Clear Environment Cache", clear_env_cache),
        ("Test Database Import", test_database_import)
    ]
    
    all_passed = True
    
    for check_name, check_func in checks:
        print(f"\n🔍 Checking {check_name}...")
        try:
            if not check_func():
                all_passed = False
        except Exception as e:
            print(f"❌ {check_name} check failed with error: {e}")
            all_passed = False
    
    print("\n" + "=" * 50)
    
    if all_passed:
        print("✅ All checks passed! Ready to start the application.")
        print("\nStart the server with:")
        print("  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
        return 0
    else:
        print("❌ Some checks failed. Please fix the issues above.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    print(f"\n🏁 Startup check completed with exit code: {exit_code}")
    sys.exit(exit_code)
