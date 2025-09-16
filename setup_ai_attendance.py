#!/usr/bin/env python3
"""
Setup script for AI Face Recognition Attendance System
This script helps install dependencies and configure the system
"""

import os
import sys
import subprocess
import sqlite3
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required")
        print(f"Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version}")
    return True

def install_dependencies():
    """Install required Python packages"""
    print("\n📦 Installing dependencies...")
    
    try:
        # Install packages from requirements.txt
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def create_directories():
    """Create necessary directories"""
    print("\n📁 Creating directories...")
    
    directories = [
        'face_data',
        'logs',
        'backups'
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ Created directory: {directory}")

def initialize_database():
    """Initialize the SQLite database"""
    print("\n🗄️ Initializing database...")
    
    try:
        conn = sqlite3.connect('face_attendance.db')
        cursor = conn.cursor()
        
        # Students table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                class TEXT NOT NULL,
                section TEXT NOT NULL,
                face_encoding BLOB,
                face_image_path TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Attendance records table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS attendance_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT NOT NULL,
                date DATE NOT NULL,
                time TIME NOT NULL,
                status TEXT NOT NULL,
                confidence_score REAL,
                location_lat REAL,
                location_lng REAL,
                distance_from_school REAL,
                image_path TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students (student_id)
            )
        ''')
        
        # Recognition sessions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS recognition_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE NOT NULL,
                student_id TEXT,
                status TEXT NOT NULL,
                confidence_score REAL,
                location_verified BOOLEAN,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students (student_id)
            )
        ''')
        
        conn.commit()
        conn.close()
        print("✅ Database initialized successfully")
        return True
        
    except Exception as e:
        print(f"❌ Failed to initialize database: {e}")
        return False

def create_sample_data():
    """Create sample student data for testing"""
    print("\n👥 Creating sample data...")
    
    try:
        conn = sqlite3.connect('face_attendance.db')
        cursor = conn.cursor()
        
        # Sample students (without face encodings)
        sample_students = [
            ('STU001', 'Aarav Patel', '12', 'A'),
            ('STU002', 'Meera Singh', '11', 'B'),
            ('STU003', 'Rohan Kumar', '10', 'C'),
            ('STU004', 'Priya Sharma', '12', 'A'),
            ('STU005', 'Arjun Gupta', '11', 'B')
        ]
        
        for student_id, name, class_name, section in sample_students:
            cursor.execute('''
                INSERT OR IGNORE INTO students 
                (student_id, name, class, section)
                VALUES (?, ?, ?, ?)
            ''', (student_id, name, class_name, section))
        
        conn.commit()
        conn.close()
        print("✅ Sample data created successfully")
        return True
        
    except Exception as e:
        print(f"❌ Failed to create sample data: {e}")
        return False

def create_config_file():
    """Create configuration file"""
    print("\n⚙️ Creating configuration file...")
    
    config_content = """# AI Face Recognition Attendance System Configuration

# School Location (Update these coordinates to your school's location)
SCHOOL_LATITUDE = 28.6139  # Delhi coordinates - CHANGE THIS
SCHOOL_LONGITUDE = 77.2090  # Delhi coordinates - CHANGE THIS
SCHOOL_RADIUS_KM = 0.5  # 500 meters radius

# Face Recognition Settings
CONFIDENCE_THRESHOLD = 0.6  # Minimum confidence for face recognition
FACE_ENCODING_TOLERANCE = 0.6  # Tolerance for face matching

# Server Settings
SERVER_HOST = '0.0.0.0'
SERVER_PORT = 5000
DEBUG_MODE = True

# Database Settings
DATABASE_PATH = 'face_attendance.db'

# File Upload Settings
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif']

# Logging Settings
LOG_LEVEL = 'INFO'
LOG_FILE = 'logs/face_recognition.log'
"""
    
    try:
        with open('config.py', 'w') as f:
            f.write(config_content)
        print("✅ Configuration file created: config.py")
        print("⚠️  Please update the school coordinates in config.py")
        return True
    except Exception as e:
        print(f"❌ Failed to create config file: {e}")
        return False

def create_startup_script():
    """Create startup script for the server"""
    print("\n🚀 Creating startup script...")
    
    startup_content = """#!/bin/bash
# Startup script for AI Face Recognition Attendance System

echo "Starting AI Face Recognition Attendance Server..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Start the server
echo "Starting server on http://localhost:5000"
python3 face_recognition_server.py
"""
    
    try:
        with open('start_server.sh', 'w') as f:
            f.write(startup_content)
        os.chmod('start_server.sh', 0o755)
        print("✅ Startup script created: start_server.sh")
        return True
    except Exception as e:
        print(f"❌ Failed to create startup script: {e}")
        return False

def create_windows_batch():
    """Create Windows batch file for starting the server"""
    print("\n🪟 Creating Windows batch file...")
    
    batch_content = """@echo off
REM Startup script for AI Face Recognition Attendance System (Windows)

echo Starting AI Face Recognition Attendance Server...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\\Scripts\\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Start the server
echo Starting server on http://localhost:5000
python face_recognition_server.py

pause
"""
    
    try:
        with open('start_server.bat', 'w') as f:
            f.write(batch_content)
        print("✅ Windows batch file created: start_server.bat")
        return True
    except Exception as e:
        print(f"❌ Failed to create Windows batch file: {e}")
        return False

def main():
    """Main setup function"""
    print("🤖 AI Face Recognition Attendance System Setup")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        return False
    
    # Install dependencies
    if not install_dependencies():
        return False
    
    # Create directories
    create_directories()
    
    # Initialize database
    if not initialize_database():
        return False
    
    # Create sample data
    create_sample_data()
    
    # Create configuration file
    create_config_file()
    
    # Create startup scripts
    create_startup_script()
    create_windows_batch()
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Update school coordinates in config.py")
    print("2. Run the server:")
    print("   - Linux/Mac: ./start_server.sh")
    print("   - Windows: start_server.bat")
    print("   - Manual: python face_recognition_server.py")
    print("3. Open your browser and go to http://localhost:5000")
    print("4. Register student faces using the /api/register-face endpoint")
    print("5. Test face recognition using the student dashboard")
    
    print("\n⚠️  Important Notes:")
    print("- Make sure to update the school location coordinates")
    print("- Ensure good lighting for face recognition")
    print("- Students need to register their faces first")
    print("- Location permission is required for attendance marking")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        print("\n❌ Setup failed. Please check the errors above.")
        sys.exit(1)
