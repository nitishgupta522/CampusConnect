#!/usr/bin/env python3
"""
AI-Powered Face Recognition Attendance System
Server-side Python implementation with Flask API
"""

import os
import cv2
import numpy as np
import face_recognition
import json
import sqlite3
import base64
import requests
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import geopy.distance
import hashlib
import logging
from werkzeug.utils import secure_filename
import threading
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'face_data'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
SCHOOL_LOCATION = {
    'latitude': 28.6139,  # Delhi coordinates (can be changed to actual school location)
    'longitude': 77.2090,
    'radius_km': 0.5  # 500 meters radius
}

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Database setup
def init_database():
    """Initialize SQLite database for face recognition data"""
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
    
    # Face recognition sessions table
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
    logger.info("Database initialized successfully")

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in kilometers"""
    coords_1 = (lat1, lon1)
    coords_2 = (lat2, lon2)
    return geopy.distance.geodesic(coords_1, coords_2).kilometers

def verify_location(student_lat, student_lng):
    """Verify if student is within school premises"""
    distance = calculate_distance(
        student_lat, student_lng,
        SCHOOL_LOCATION['latitude'], SCHOOL_LOCATION['longitude']
    )
    return distance <= SCHOOL_LOCATION['radius_km'], distance

def encode_face_from_image(image_path):
    """Extract face encoding from image"""
    try:
        image = face_recognition.load_image_file(image_path)
        face_encodings = face_recognition.face_encodings(image)
        
        if len(face_encodings) > 0:
            return face_encodings[0]
        else:
            return None
    except Exception as e:
        logger.error(f"Error encoding face from {image_path}: {str(e)}")
        return None

def save_face_encoding(student_id, face_encoding, image_path):
    """Save face encoding to database"""
    conn = sqlite3.connect('face_attendance.db')
    cursor = conn.cursor()
    
    # Convert numpy array to binary
    encoding_blob = face_encoding.tobytes()
    
    cursor.execute('''
        INSERT OR REPLACE INTO students 
        (student_id, face_encoding, face_image_path)
        VALUES (?, ?, ?)
    ''', (student_id, encoding_blob, image_path))
    
    conn.commit()
    conn.close()

def load_all_face_encodings():
    """Load all face encodings from database"""
    conn = sqlite3.connect('face_attendance.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT student_id, name, class, section, face_encoding 
        FROM students 
        WHERE face_encoding IS NOT NULL
    ''')
    
    students = []
    for row in cursor.fetchall():
        student_id, name, class_name, section, encoding_blob = row
        if encoding_blob:
            face_encoding = np.frombuffer(encoding_blob, dtype=np.float64)
            students.append({
                'student_id': student_id,
                'name': name,
                'class': class_name,
                'section': section,
                'face_encoding': face_encoding
            })
    
    conn.close()
    return students

@app.route('/api/register-face', methods=['POST'])
def register_face():
    """Register a new student's face"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Get student data
        student_id = request.form.get('student_id')
        name = request.form.get('name')
        class_name = request.form.get('class')
        section = request.form.get('section')
        
        if not all([student_id, name, class_name, section]):
            return jsonify({'error': 'Missing required student information'}), 400
        
        # Save uploaded file
        filename = secure_filename(f"{student_id}_{file.filename}")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Extract face encoding
        face_encoding = encode_face_from_image(filepath)
        
        if face_encoding is None:
            os.remove(filepath)  # Clean up file
            return jsonify({'error': 'No face detected in image'}), 400
        
        # Save to database
        conn = sqlite3.connect('face_attendance.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO students 
            (student_id, name, class, section, face_encoding, face_image_path)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (student_id, name, class_name, section, face_encoding.tobytes(), filepath))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Face registered for student {student_id}")
        return jsonify({
            'success': True,
            'message': 'Face registered successfully',
            'student_id': student_id
        })
        
    except Exception as e:
        logger.error(f"Error registering face: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/recognize-face', methods=['POST'])
def recognize_face():
    """Recognize face and mark attendance"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Get location data
        student_lat = float(request.form.get('latitude', 0))
        student_lng = float(request.form.get('longitude', 0))
        
        # Verify location
        location_verified, distance = verify_location(student_lat, student_lng)
        
        if not location_verified:
            return jsonify({
                'error': 'Location verification failed',
                'message': f'You are {distance:.2f} km away from school. Please be within {SCHOOL_LOCATION["radius_km"]} km to mark attendance.',
                'distance': distance
            }), 400
        
        # Save uploaded image temporarily
        temp_filename = f"temp_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
        temp_filepath = os.path.join(UPLOAD_FOLDER, temp_filename)
        file.save(temp_filepath)
        
        # Extract face encoding from uploaded image
        unknown_face_encoding = encode_face_from_image(temp_filepath)
        
        if unknown_face_encoding is None:
            os.remove(temp_filepath)
            return jsonify({'error': 'No face detected in image'}), 400
        
        # Load all registered faces
        known_students = load_all_face_encodings()
        
        if not known_students:
            os.remove(temp_filepath)
            return jsonify({'error': 'No registered faces found'}), 400
        
        # Compare faces
        best_match = None
        best_distance = float('inf')
        
        for student in known_students:
            face_distance = face_recognition.face_distance(
                [student['face_encoding']], 
                unknown_face_encoding
            )[0]
            
            if face_distance < best_distance:
                best_distance = face_distance
                best_match = student
        
        # Check if match is confident enough (threshold: 0.6)
        confidence_threshold = 0.6
        if best_distance > confidence_threshold:
            os.remove(temp_filepath)
            return jsonify({
                'error': 'Face not recognized',
                'message': 'No matching face found in the database'
            }), 400
        
        # Calculate confidence score
        confidence_score = (1 - best_distance) * 100
        
        # Check if attendance already marked today
        today = datetime.now().date()
        conn = sqlite3.connect('face_attendance.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id FROM attendance_records 
            WHERE student_id = ? AND date = ?
        ''', (best_match['student_id'], today))
        
        if cursor.fetchone():
            conn.close()
            os.remove(temp_filepath)
            return jsonify({
                'error': 'Attendance already marked',
                'message': 'You have already marked attendance for today'
            }), 400
        
        # Save attendance record
        now = datetime.now()
        cursor.execute('''
            INSERT INTO attendance_records 
            (student_id, date, time, status, confidence_score, 
             location_lat, location_lng, distance_from_school, image_path)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            best_match['student_id'], today, now.time(), 'present',
            confidence_score, student_lat, student_lng, distance, temp_filepath
        ))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Attendance marked for student {best_match['student_id']}")
        
        return jsonify({
            'success': True,
            'message': 'Attendance marked successfully',
            'student': {
                'student_id': best_match['student_id'],
                'name': best_match['name'],
                'class': best_match['class'],
                'section': best_match['section']
            },
            'attendance': {
                'date': today.isoformat(),
                'time': now.time().isoformat(),
                'status': 'present',
                'confidence_score': round(confidence_score, 2),
                'location_verified': location_verified,
                'distance_from_school': round(distance, 2)
            }
        })
        
    except Exception as e:
        logger.error(f"Error recognizing face: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/attendance-history/<student_id>', methods=['GET'])
def get_attendance_history(student_id):
    """Get attendance history for a student"""
    try:
        conn = sqlite3.connect('face_attendance.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT date, time, status, confidence_score, location_lat, location_lng, distance_from_school
            FROM attendance_records 
            WHERE student_id = ?
            ORDER BY date DESC, time DESC
            LIMIT 30
        ''', (student_id,))
        
        records = []
        for row in cursor.fetchall():
            date, time, status, confidence, lat, lng, distance = row
            records.append({
                'date': date,
                'time': time,
                'status': status,
                'confidence_score': confidence,
                'location': {'lat': lat, 'lng': lng},
                'distance_from_school': distance
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'student_id': student_id,
            'records': records
        })
        
    except Exception as e:
        logger.error(f"Error getting attendance history: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/attendance-stats/<student_id>', methods=['GET'])
def get_attendance_stats(student_id):
    """Get attendance statistics for a student"""
    try:
        conn = sqlite3.connect('face_attendance.db')
        cursor = conn.cursor()
        
        # Get total days and present days for current month
        current_month = datetime.now().strftime('%Y-%m')
        cursor.execute('''
            SELECT COUNT(*) as total_days,
                   SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days
            FROM attendance_records 
            WHERE student_id = ? AND date LIKE ?
        ''', (student_id, f"{current_month}%"))
        
        row = cursor.fetchone()
        total_days = row[0] if row[0] else 0
        present_days = row[1] if row[1] else 0
        attendance_percentage = (present_days / total_days * 100) if total_days > 0 else 0
        
        conn.close()
        
        return jsonify({
            'success': True,
            'student_id': student_id,
            'stats': {
                'total_days': total_days,
                'present_days': present_days,
                'attendance_percentage': round(attendance_percentage, 2),
                'month': current_month
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting attendance stats: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/class-attendance/<class_name>/<section>', methods=['GET'])
def get_class_attendance(class_name, section):
    """Get attendance for entire class"""
    try:
        conn = sqlite3.connect('face_attendance.db')
        cursor = conn.cursor()
        
        # Get all students in class
        cursor.execute('''
            SELECT student_id, name FROM students 
            WHERE class = ? AND section = ?
        ''', (class_name, section))
        
        students = cursor.fetchall()
        
        # Get today's attendance
        today = datetime.now().date()
        cursor.execute('''
            SELECT student_id FROM attendance_records 
            WHERE date = ? AND status = 'present'
        ''', (today,))
        
        present_students = set(row[0] for row in cursor.fetchall())
        
        # Prepare response
        class_attendance = []
        for student_id, name in students:
            class_attendance.append({
                'student_id': student_id,
                'name': name,
                'present': student_id in present_students
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'class': class_name,
            'section': section,
            'date': today.isoformat(),
            'attendance': class_attendance,
            'summary': {
                'total_students': len(students),
                'present_students': len(present_students),
                'attendance_percentage': round(len(present_students) / len(students) * 100, 2) if students else 0
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting class attendance: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/school-location', methods=['GET'])
def get_school_location():
    """Get school location configuration"""
    return jsonify({
        'success': True,
        'location': SCHOOL_LOCATION
    })

if __name__ == '__main__':
    # Initialize database
    init_database()
    
    # Start Flask server
    logger.info("Starting Face Recognition Attendance Server...")
    logger.info(f"School location: {SCHOOL_LOCATION['latitude']}, {SCHOOL_LOCATION['longitude']}")
    logger.info(f"Allowed radius: {SCHOOL_LOCATION['radius_km']} km")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
