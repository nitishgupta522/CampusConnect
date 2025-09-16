// AI Face Recognition Attendance Client
// JavaScript module to interact with Python face recognition server

class AIAttendanceManager {
    constructor() {
        this.serverUrl = 'http://localhost:5000/api';
        this.currentStudent = null;
        this.isCapturing = false;
        this.videoStream = null;
        this.canvas = null;
        this.context = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for student login
        if (window.ModuleEventBus) {
            window.ModuleEventBus.on('studentLogin', (studentData) => {
                this.currentStudent = studentData;
                this.loadStudentData();
            });
        }
    }

    // Initialize AI attendance system
    init() {
        this.loadCurrentStudent();
        this.setupAIUI();
        this.requestLocationPermission();
    }

    // Load current student data
    loadCurrentStudent() {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (user.role === 'student') {
            this.currentStudent = user;
        }
    }

    // Setup AI attendance UI
    setupAIUI() {
        const attendanceSection = document.getElementById('attendance-section-content');
        if (!attendanceSection) return;

        attendanceSection.innerHTML = `
            <div class="ai-attendance-container">
                <div class="attendance-header">
                    <h2><i class="fas fa-face-smile"></i> AI Face Recognition Attendance</h2>
                    <p>Mark your attendance using advanced face recognition technology</p>
                </div>

                <div class="attendance-status-card">
                    <div class="status-indicator" id="location-status">
                        <i class="fas fa-map-marker-alt"></i>
                        <span id="location-text">Checking location...</span>
                    </div>
                    <div class="status-indicator" id="camera-status">
                        <i class="fas fa-camera"></i>
                        <span id="camera-text">Camera not initialized</span>
                    </div>
                    <div class="status-indicator" id="face-status">
                        <i class="fas fa-user-check"></i>
                        <span id="face-text">Face not detected</span>
                    </div>
                </div>

                <div class="attendance-main">
                    <div class="camera-section">
                        <div class="camera-container">
                            <video id="face-video" autoplay muted playsinline></video>
                            <canvas id="face-canvas" style="display: none;"></canvas>
                            <div class="face-overlay">
                                <div class="face-guide">
                                    <div class="guide-circle"></div>
                                    <p>Position your face within the circle</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="camera-controls">
                            <button id="start-camera-btn" class="btn-primary" onclick="aiAttendanceManager.startCamera()">
                                <i class="fas fa-camera"></i> Start Camera
                            </button>
                            <button id="capture-face-btn" class="btn-success" onclick="aiAttendanceManager.captureFace()" disabled>
                                <i class="fas fa-camera-retro"></i> Mark Attendance
                            </button>
                            <button id="stop-camera-btn" class="btn-secondary" onclick="aiAttendanceManager.stopCamera()" disabled>
                                <i class="fas fa-stop"></i> Stop Camera
                            </button>
                        </div>
                    </div>

                    <div class="attendance-info">
                        <div class="info-card">
                            <h3><i class="fas fa-info-circle"></i> Instructions</h3>
                            <ul>
                                <li>Ensure you are within school premises</li>
                                <li>Position your face clearly in front of the camera</li>
                                <li>Make sure there's good lighting</li>
                                <li>Remove any face coverings (masks, sunglasses)</li>
                                <li>Look directly at the camera</li>
                            </ul>
                        </div>

                        <div class="info-card">
                            <h3><i class="fas fa-chart-line"></i> Today's Status</h3>
                            <div class="status-details">
                                <div class="status-item">
                                    <span class="label">Attendance Status:</span>
                                    <span class="value" id="today-status">Not marked</span>
                                </div>
                                <div class="status-item">
                                    <span class="label">Time:</span>
                                    <span class="value" id="attendance-time">-</span>
                                </div>
                                <div class="status-item">
                                    <span class="label">Confidence:</span>
                                    <span class="value" id="confidence-score">-</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="attendance-history">
                    <h3><i class="fas fa-history"></i> Recent Attendance</h3>
                    <div class="history-list" id="attendance-history-list">
                        <div class="loading">Loading attendance history...</div>
                    </div>
                </div>

                <div class="attendance-stats">
                    <h3><i class="fas fa-chart-pie"></i> Monthly Statistics</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
                            <div class="stat-info">
                                <div class="stat-value" id="present-days">0</div>
                                <div class="stat-label">Present Days</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-calendar-times"></i></div>
                            <div class="stat-info">
                                <div class="stat-value" id="total-days">0</div>
                                <div class="stat-label">Total Days</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-percentage"></i></div>
                            <div class="stat-info">
                                <div class="stat-value" id="attendance-percentage">0%</div>
                                <div class="stat-label">Attendance %</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.addAIStyles();
        this.loadAttendanceData();
    }

    // Add CSS styles for AI attendance
    addAIStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .ai-attendance-container {
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                margin-bottom: 20px;
            }

            .attendance-header {
                text-align: center;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 2px solid #f0f0f0;
            }

            .attendance-header h2 {
                color: #1e293b;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .attendance-header p {
                color: #64748b;
                margin: 0;
            }

            .attendance-status-card {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 25px;
            }

            .status-indicator {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px;
                background: #f8fafc;
                border-radius: 8px;
                border-left: 4px solid #6b7280;
            }

            .status-indicator.success {
                border-left-color: #10b981;
                background: #f0fdf4;
            }

            .status-indicator.warning {
                border-left-color: #f59e0b;
                background: #fffbeb;
            }

            .status-indicator.error {
                border-left-color: #ef4444;
                background: #fef2f2;
            }

            .status-indicator i {
                font-size: 16px;
                color: #6b7280;
            }

            .status-indicator.success i {
                color: #10b981;
            }

            .status-indicator.warning i {
                color: #f59e0b;
            }

            .status-indicator.error i {
                color: #ef4444;
            }

            .attendance-main {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 25px;
                margin-bottom: 25px;
            }

            .camera-section {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
            }

            .camera-container {
                position: relative;
                width: 100%;
                max-width: 400px;
                margin: 0 auto 20px;
                border-radius: 8px;
                overflow: hidden;
                background: #000;
            }

            #face-video {
                width: 100%;
                height: 300px;
                object-fit: cover;
            }

            .face-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: none;
            }

            .face-guide {
                text-align: center;
                color: white;
            }

            .guide-circle {
                width: 200px;
                height: 200px;
                border: 3px solid rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                margin: 0 auto 10px;
                position: relative;
            }

            .guide-circle::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 180px;
                height: 180px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
            }

            .face-guide p {
                margin: 0;
                font-size: 14px;
                text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            }

            .camera-controls {
                display: flex;
                gap: 10px;
                justify-content: center;
                flex-wrap: wrap;
            }

            .btn-primary, .btn-success, .btn-secondary {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .btn-primary {
                background: #3b82f6;
                color: white;
            }

            .btn-primary:hover:not(:disabled) {
                background: #2563eb;
            }

            .btn-success {
                background: #10b981;
                color: white;
            }

            .btn-success:hover:not(:disabled) {
                background: #059669;
            }

            .btn-secondary {
                background: #6b7280;
                color: white;
            }

            .btn-secondary:hover:not(:disabled) {
                background: #4b5563;
            }

            .btn-primary:disabled, .btn-success:disabled, .btn-secondary:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .attendance-info {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .info-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
            }

            .info-card h3 {
                color: #374151;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .info-card ul {
                margin: 0;
                padding-left: 20px;
            }

            .info-card li {
                margin-bottom: 8px;
                color: #64748b;
            }

            .status-details {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .status-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #e2e8f0;
            }

            .status-item:last-child {
                border-bottom: none;
            }

            .status-item .label {
                color: #64748b;
                font-size: 14px;
            }

            .status-item .value {
                font-weight: 600;
                color: #1e293b;
            }

            .attendance-history, .attendance-stats {
                margin-top: 25px;
            }

            .attendance-history h3, .attendance-stats h3 {
                color: #374151;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .history-list {
                max-height: 300px;
                overflow-y: auto;
            }

            .history-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                margin-bottom: 8px;
                background: #f9fafb;
                border-radius: 6px;
                border-left: 4px solid #6b7280;
            }

            .history-item.present {
                border-left-color: #10b981;
            }

            .history-item.absent {
                border-left-color: #ef4444;
            }

            .history-date {
                font-weight: 600;
                color: #1e293b;
            }

            .history-time {
                font-size: 14px;
                color: #64748b;
            }

            .history-status {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
            }

            .history-status.present {
                background: #d1fae5;
                color: #065f46;
            }

            .history-status.absent {
                background: #fee2e2;
                color: #991b1b;
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
            }

            .stat-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
            }

            .stat-icon {
                font-size: 24px;
                color: #3b82f6;
                margin-bottom: 10px;
            }

            .stat-value {
                font-size: 24px;
                font-weight: 700;
                color: #1e293b;
                margin-bottom: 5px;
            }

            .stat-label {
                font-size: 14px;
                color: #64748b;
            }

            .loading {
                text-align: center;
                padding: 20px;
                color: #6b7280;
            }

            @media (max-width: 768px) {
                .attendance-main {
                    grid-template-columns: 1fr;
                }
                
                .camera-controls {
                    flex-direction: column;
                }
                
                .stats-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Request location permission
    async requestLocationPermission() {
        if (!navigator.geolocation) {
            this.updateLocationStatus('error', 'Geolocation not supported');
            return;
        }

        try {
            const position = await this.getCurrentPosition();
            this.updateLocationStatus('success', 'Location verified');
            this.currentLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
        } catch (error) {
            this.updateLocationStatus('error', 'Location access denied');
            console.error('Location error:', error);
        }
    }

    // Get current position with promise
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            });
        });
    }

    // Update location status
    updateLocationStatus(status, message) {
        const locationStatus = document.getElementById('location-status');
        const locationText = document.getElementById('location-text');
        
        locationStatus.className = `status-indicator ${status}`;
        locationText.textContent = message;
    }

    // Start camera
    async startCamera() {
        try {
            this.videoStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });

            const video = document.getElementById('face-video');
            video.srcObject = this.videoStream;

            this.updateCameraStatus('success', 'Camera active');
            
            // Enable/disable buttons
            document.getElementById('start-camera-btn').disabled = true;
            document.getElementById('capture-face-btn').disabled = false;
            document.getElementById('stop-camera-btn').disabled = false;

            this.isCapturing = true;

        } catch (error) {
            this.updateCameraStatus('error', 'Camera access denied');
            console.error('Camera error:', error);
        }
    }

    // Stop camera
    stopCamera() {
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }

        const video = document.getElementById('face-video');
        video.srcObject = null;

        this.updateCameraStatus('warning', 'Camera stopped');
        
        // Enable/disable buttons
        document.getElementById('start-camera-btn').disabled = false;
        document.getElementById('capture-face-btn').disabled = true;
        document.getElementById('stop-camera-btn').disabled = true;

        this.isCapturing = false;
    }

    // Update camera status
    updateCameraStatus(status, message) {
        const cameraStatus = document.getElementById('camera-status');
        const cameraText = document.getElementById('camera-text');
        
        cameraStatus.className = `status-indicator ${status}`;
        cameraText.textContent = message;
    }

    // Capture face and mark attendance
    async captureFace() {
        if (!this.isCapturing || !this.currentLocation) {
            if (window.notificationManager) {
                window.notificationManager.warning('Please start camera and allow location access');
            }
            return;
        }

        try {
            const video = document.getElementById('face-video');
            const canvas = document.getElementById('face-canvas');
            const context = canvas.getContext('2d');

            // Set canvas dimensions
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw current frame
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert to blob
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/jpeg', 0.8);
            });

            // Create form data
            const formData = new FormData();
            formData.append('image', blob, 'face_capture.jpg');
            formData.append('latitude', this.currentLocation.latitude);
            formData.append('longitude', this.currentLocation.longitude);

            // Show loading
            this.updateFaceStatus('warning', 'Processing face recognition...');

            // Send to Python server
            const response = await fetch(`${this.serverUrl}/recognize-face`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.updateFaceStatus('success', 'Face recognized successfully');
                this.updateAttendanceInfo(result);
                this.loadAttendanceData();
                
                if (window.notificationManager) {
                    window.notificationManager.success(`Attendance marked successfully! Confidence: ${result.attendance.confidence_score}%`);
                }
            } else {
                this.updateFaceStatus('error', result.message || 'Face recognition failed');
                
                if (window.notificationManager) {
                    window.notificationManager.error(result.message || 'Face recognition failed');
                }
            }

        } catch (error) {
            this.updateFaceStatus('error', 'Network error');
            console.error('Capture error:', error);
            
            if (window.notificationManager) {
                window.notificationManager.error('Failed to mark attendance. Please try again.');
            }
        }
    }

    // Update face status
    updateFaceStatus(status, message) {
        const faceStatus = document.getElementById('face-status');
        const faceText = document.getElementById('face-text');
        
        faceStatus.className = `status-indicator ${status}`;
        faceText.textContent = message;
    }

    // Update attendance info
    updateAttendanceInfo(result) {
        document.getElementById('today-status').textContent = 'Present';
        document.getElementById('attendance-time').textContent = result.attendance.time;
        document.getElementById('confidence-score').textContent = `${result.attendance.confidence_score}%`;
    }

    // Load attendance data
    async loadAttendanceData() {
        if (!this.currentStudent) return;

        try {
            // Load attendance history
            const historyResponse = await fetch(`${this.serverUrl}/attendance-history/${this.currentStudent.id}`);
            const historyResult = await historyResponse.json();

            if (historyResult.success) {
                this.updateAttendanceHistory(historyResult.records);
            }

            // Load attendance stats
            const statsResponse = await fetch(`${this.serverUrl}/attendance-stats/${this.currentStudent.id}`);
            const statsResult = await statsResponse.json();

            if (statsResult.success) {
                this.updateAttendanceStats(statsResult.stats);
            }

        } catch (error) {
            console.error('Error loading attendance data:', error);
        }
    }

    // Update attendance history
    updateAttendanceHistory(records) {
        const historyList = document.getElementById('attendance-history-list');
        
        if (records.length === 0) {
            historyList.innerHTML = '<div class="loading">No attendance records found</div>';
            return;
        }

        historyList.innerHTML = records.map(record => `
            <div class="history-item ${record.status}">
                <div>
                    <div class="history-date">${new Date(record.date).toLocaleDateString()}</div>
                    <div class="history-time">${record.time}</div>
                </div>
                <div class="history-status ${record.status}">${record.status.toUpperCase()}</div>
            </div>
        `).join('');
    }

    // Update attendance stats
    updateAttendanceStats(stats) {
        document.getElementById('present-days').textContent = stats.present_days;
        document.getElementById('total-days').textContent = stats.total_days;
        document.getElementById('attendance-percentage').textContent = `${stats.attendance_percentage}%`;
    }

    // Load student data
    loadStudentData() {
        if (this.currentStudent) {
            this.loadAttendanceData();
        }
    }
}

// Initialize AI attendance manager
window.aiAttendanceManager = new AIAttendanceManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIAttendanceManager;
}
