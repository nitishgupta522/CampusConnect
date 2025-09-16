# AI-Powered Face Recognition Attendance System

## Overview
This system provides advanced face recognition-based attendance marking for students using artificial intelligence. It includes location verification to ensure students are within school premises when marking attendance.

## Features
- 🤖 **AI Face Recognition**: Advanced face detection and recognition using Python libraries
- 📍 **Location Verification**: GPS-based location checking to ensure students are at school
- 📱 **Real-time Processing**: Instant attendance marking with confidence scores
- 📊 **Analytics Dashboard**: Comprehensive attendance statistics and history
- 🔒 **Security**: Secure face encoding storage and verification
- 📱 **Cross-platform**: Works on web browsers with camera access

## System Architecture

### Backend (Python)
- **Flask API Server**: RESTful API for face recognition operations
- **Face Recognition Library**: Uses `face_recognition` library for AI processing
- **SQLite Database**: Stores student data, face encodings, and attendance records
- **Location Services**: GPS verification using `geopy` library

### Frontend (JavaScript)
- **Camera Integration**: WebRTC for camera access
- **Real-time UI**: Dynamic status indicators and progress tracking
- **API Communication**: HTTP requests to Python backend
- **Responsive Design**: Mobile-friendly interface

## Installation & Setup

### Prerequisites
- Python 3.7 or higher
- Modern web browser with camera support
- Internet connection for location services

### Quick Setup
1. **Run the setup script**:
   ```bash
   python setup_ai_attendance.py
   ```

2. **Update school location** in `config.py`:
   ```python
   SCHOOL_LATITUDE = 28.6139  # Your school's latitude
   SCHOOL_LONGITUDE = 77.2090  # Your school's longitude
   SCHOOL_RADIUS_KM = 0.5  # Allowed radius in kilometers
   ```

3. **Start the server**:
   - **Linux/Mac**: `./start_server.sh`
   - **Windows**: `start_server.bat`
   - **Manual**: `python face_recognition_server.py`

4. **Access the system**:
   - Server: http://localhost:5000
   - Student Dashboard: Use the attendance section

## API Endpoints

### Register Student Face
```http
POST /api/register-face
Content-Type: multipart/form-data

Parameters:
- image: Face image file (JPG, PNG)
- student_id: Student ID
- name: Student name
- class: Student class
- section: Student section
```

### Recognize Face & Mark Attendance
```http
POST /api/recognize-face
Content-Type: multipart/form-data

Parameters:
- image: Face image file
- latitude: Student's current latitude
- longitude: Student's current longitude
```

### Get Attendance History
```http
GET /api/attendance-history/{student_id}
```

### Get Attendance Statistics
```http
GET /api/attendance-stats/{student_id}
```

### Get Class Attendance
```http
GET /api/class-attendance/{class}/{section}
```

## Usage Guide

### For Students
1. **First Time Setup**:
   - Register your face with a clear photo
   - Ensure good lighting and no face coverings

2. **Marking Attendance**:
   - Go to the Attendance section in student dashboard
   - Allow camera and location permissions
   - Position face within the guide circle
   - Click "Mark Attendance"

3. **Requirements**:
   - Be within school premises (GPS verified)
   - Good lighting conditions
   - Clear view of face
   - Stable internet connection

### For Administrators
1. **Configure School Location**:
   - Update coordinates in `config.py`
   - Set appropriate radius for school premises

2. **Monitor System**:
   - Check server logs for any issues
   - Monitor attendance records in database
   - Review confidence scores

## Technical Details

### Face Recognition Process
1. **Face Detection**: Uses OpenCV to detect faces in images
2. **Feature Extraction**: Extracts 128-dimensional face encodings
3. **Comparison**: Compares with stored encodings using Euclidean distance
4. **Confidence Scoring**: Calculates confidence percentage based on distance

### Location Verification
1. **GPS Acquisition**: Gets student's current location
2. **Distance Calculation**: Calculates distance from school coordinates
3. **Verification**: Ensures student is within allowed radius
4. **Security**: Prevents attendance marking from outside school

### Database Schema
```sql
-- Students table
CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    student_id TEXT UNIQUE,
    name TEXT,
    class TEXT,
    section TEXT,
    face_encoding BLOB,
    face_image_path TEXT,
    created_at TIMESTAMP
);

-- Attendance records table
CREATE TABLE attendance_records (
    id INTEGER PRIMARY KEY,
    student_id TEXT,
    date DATE,
    time TIME,
    status TEXT,
    confidence_score REAL,
    location_lat REAL,
    location_lng REAL,
    distance_from_school REAL,
    image_path TEXT,
    created_at TIMESTAMP
);
```

## Configuration Options

### Face Recognition Settings
```python
CONFIDENCE_THRESHOLD = 0.6  # Minimum confidence for recognition
FACE_ENCODING_TOLERANCE = 0.6  # Face matching tolerance
```

### Location Settings
```python
SCHOOL_LATITUDE = 28.6139  # School latitude
SCHOOL_LONGITUDE = 77.2090  # School longitude
SCHOOL_RADIUS_KM = 0.5  # Allowed radius in km
```

### Server Settings
```python
SERVER_HOST = '0.0.0.0'  # Server host
SERVER_PORT = 5000  # Server port
DEBUG_MODE = True  # Debug mode
```

## Troubleshooting

### Common Issues

1. **Camera Not Working**:
   - Check browser permissions
   - Ensure HTTPS connection
   - Try different browser

2. **Location Access Denied**:
   - Enable location services
   - Check browser permissions
   - Ensure GPS is enabled

3. **Face Not Recognized**:
   - Check lighting conditions
   - Ensure face is clearly visible
   - Verify face is registered in system

4. **Location Verification Failed**:
   - Check school coordinates
   - Verify GPS accuracy
   - Ensure within school radius

### Error Codes
- `400`: Bad request (missing parameters)
- `401`: Unauthorized (location verification failed)
- `404`: Not found (student not registered)
- `500`: Internal server error

## Security Considerations

### Data Protection
- Face encodings are stored as binary blobs
- Original images are stored securely
- No raw biometric data in logs

### Privacy
- Students must consent to face registration
- Data is stored locally on school server
- No third-party data sharing

### Access Control
- Location-based verification
- Time-based attendance windows
- Confidence score thresholds

## Performance Optimization

### Recommendations
- Use SSD storage for database
- Ensure good lighting for face recognition
- Maintain stable internet connection
- Regular database cleanup

### Monitoring
- Check server logs regularly
- Monitor confidence scores
- Track recognition success rates
- Monitor location verification accuracy

## Future Enhancements

### Planned Features
- Multi-face detection
- Attendance analytics dashboard
- Mobile app integration
- Advanced reporting features
- Integration with existing school systems

### Technical Improvements
- Machine learning model updates
- Performance optimizations
- Enhanced security features
- Better error handling

## Support & Maintenance

### Regular Maintenance
- Update Python dependencies
- Clean up old attendance records
- Monitor server performance
- Backup database regularly

### Troubleshooting Resources
- Check server logs in `logs/` directory
- Review database for data integrity
- Test API endpoints manually
- Verify configuration settings

## License & Credits

### Libraries Used
- `face_recognition`: Face detection and recognition
- `opencv-python`: Computer vision operations
- `Flask`: Web framework
- `geopy`: Location services
- `sqlite3`: Database operations

### Acknowledgments
- Face recognition algorithms by Adam Geitgey
- OpenCV community for computer vision tools
- Flask community for web framework

---

**Note**: This system requires proper setup and configuration. Please ensure all prerequisites are met and school coordinates are accurately configured before deployment.
