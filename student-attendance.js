// Student Attendance Module
// Handles self-attendance marking and real-time updates

class StudentAttendanceManager {
    constructor() {
        this.currentStudent = null;
        this.attendanceData = [];
        this.isMarkingAttendance = false;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for student login
        if (window.ModuleEventBus) {
            window.ModuleEventBus.on('studentLogin', (studentData) => {
                this.currentStudent = studentData;
                this.loadAttendanceData();
            });
        }

        // Listen for real-time updates
        if (window.ModuleEventBus) {
            window.ModuleEventBus.on('attendanceUpdate', (data) => {
                this.updateAttendanceDisplay(data);
            });
        }
    }

    // Initialize attendance system
    init() {
        this.loadCurrentStudent();
        this.setupAttendanceUI();
        this.startRealTimeUpdates();
    }

    // Load current student data
    loadCurrentStudent() {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (user.role === 'student') {
            this.currentStudent = user;
        }
    }

    // Setup attendance UI
    setupAttendanceUI() {
        const attendanceSection = document.getElementById('attendance-section');
        if (!attendanceSection) return;

        attendanceSection.innerHTML = `
            <div class="attendance-container">
                <div class="attendance-header">
                    <h3><i class="fas fa-calendar-check"></i> Mark Your Attendance</h3>
                    <div class="attendance-status" id="attendance-status">
                        <span class="status-indicator" id="status-indicator"></span>
                        <span id="status-text">Loading...</span>
                    </div>
                </div>
                
                <div class="attendance-actions">
                    <button id="mark-present-btn" class="btn-attendance present" onclick="studentAttendanceManager.markAttendance('present')">
                        <i class="fas fa-check-circle"></i>
                        Mark Present
                    </button>
                    <button id="mark-absent-btn" class="btn-attendance absent" onclick="studentAttendanceManager.markAttendance('absent')">
                        <i class="fas fa-times-circle"></i>
                        Mark Absent
                    </button>
                </div>

                <div class="attendance-history">
                    <h4>Recent Attendance</h4>
                    <div id="attendance-list" class="attendance-list">
                        <div class="loading">Loading attendance data...</div>
                    </div>
                </div>

                <div class="attendance-stats">
                    <div class="stat-card">
                        <div class="stat-value" id="total-days">0</div>
                        <div class="stat-label">Total Days</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="present-days">0</div>
                        <div class="stat-label">Present Days</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="attendance-percentage">0%</div>
                        <div class="stat-label">Attendance %</div>
                    </div>
                </div>
            </div>
        `;

        this.addAttendanceStyles();
    }

    // Add CSS styles for attendance
    addAttendanceStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .attendance-container {
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                margin-bottom: 20px;
            }

            .attendance-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #f0f0f0;
            }

            .attendance-status {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .status-indicator {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #6b7280;
            }

            .status-indicator.present {
                background: #10b981;
            }

            .status-indicator.absent {
                background: #ef4444;
            }

            .attendance-actions {
                display: flex;
                gap: 15px;
                margin-bottom: 25px;
            }

            .btn-attendance {
                flex: 1;
                padding: 15px 20px;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .btn-attendance.present {
                background: #10b981;
                color: white;
            }

            .btn-attendance.present:hover {
                background: #059669;
                transform: translateY(-2px);
            }

            .btn-attendance.absent {
                background: #ef4444;
                color: white;
            }

            .btn-attendance.absent:hover {
                background: #dc2626;
                transform: translateY(-2px);
            }

            .btn-attendance:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }

            .attendance-history h4 {
                margin-bottom: 15px;
                color: #374151;
            }

            .attendance-list {
                max-height: 300px;
                overflow-y: auto;
            }

            .attendance-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 15px;
                margin-bottom: 8px;
                background: #f9fafb;
                border-radius: 6px;
                border-left: 4px solid #6b7280;
            }

            .attendance-item.present {
                border-left-color: #10b981;
            }

            .attendance-item.absent {
                border-left-color: #ef4444;
            }

            .attendance-date {
                font-weight: 500;
            }

            .attendance-status-badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
            }

            .attendance-status-badge.present {
                background: #d1fae5;
                color: #065f46;
            }

            .attendance-status-badge.absent {
                background: #fee2e2;
                color: #991b1b;
            }

            .attendance-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                margin-top: 20px;
            }

            .stat-card {
                text-align: center;
                padding: 20px;
                background: #f8fafc;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
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
        `;
        document.head.appendChild(style);
    }

    // Load attendance data
    async loadAttendanceData() {
        if (!this.currentStudent) return;

        try {
            // Try to get from Firebase first
            if (typeof DatabaseHelper !== 'undefined') {
                const attendance = await DatabaseHelper.getAttendance(this.currentStudent.id);
                this.attendanceData = attendance;
            } else {
                // Fallback to localStorage
                this.attendanceData = JSON.parse(localStorage.getItem(`attendance_${this.currentStudent.id}`) || '[]');
            }

            this.updateAttendanceDisplay();
            this.updateAttendanceStats();
        } catch (error) {
            console.error('Error loading attendance data:', error);
            if (window.errorHandler) {
                window.errorHandler.handleError({
                    type: 'data',
                    message: 'Failed to load attendance data',
                    error: error
                });
            }
        }
    }

    // Mark attendance
    async markAttendance(status) {
        if (!this.currentStudent || this.isMarkingAttendance) return;

        this.isMarkingAttendance = true;
        const button = document.getElementById(`mark-${status}-btn`);
        const originalText = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Marking...';
        button.disabled = true;

        try {
            const attendanceRecord = {
                studentId: this.currentStudent.id,
                studentName: this.currentStudent.fullName || this.currentStudent.username,
                class: this.currentStudent.class || 'N/A',
                status: status,
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date().toISOString(),
                markedBy: 'self',
                location: this.getCurrentLocation()
            };

            // Check if already marked today
            const today = new Date().toISOString().split('T')[0];
            const existingRecord = this.attendanceData.find(record => 
                record.date === today && record.studentId === this.currentStudent.id
            );

            if (existingRecord) {
                throw new Error('Attendance already marked for today');
            }

            // Save to Firebase
            if (typeof DatabaseHelper !== 'undefined') {
                await DatabaseHelper.markAttendance(attendanceRecord);
            } else {
                // Fallback to localStorage
                this.attendanceData.push(attendanceRecord);
                localStorage.setItem(`attendance_${this.currentStudent.id}`, JSON.stringify(this.attendanceData));
            }

            // Update local data
            this.attendanceData.push(attendanceRecord);
            this.updateAttendanceDisplay();
            this.updateAttendanceStats();

            // Show success message
            if (window.notificationManager) {
                window.notificationManager.success(`Attendance marked as ${status} successfully!`);
            }

            // Emit event for real-time updates
            if (window.ModuleEventBus) {
                window.ModuleEventBus.emit('attendanceMarked', attendanceRecord);
            }

        } catch (error) {
            console.error('Error marking attendance:', error);
            if (window.notificationManager) {
                window.notificationManager.error(error.message || 'Failed to mark attendance');
            }
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
            this.isMarkingAttendance = false;
        }
    }

    // Update attendance display
    updateAttendanceDisplay() {
        const attendanceList = document.getElementById('attendance-list');
        if (!attendanceList) return;

        if (this.attendanceData.length === 0) {
            attendanceList.innerHTML = '<div class="loading">No attendance records found</div>';
            return;
        }

        // Sort by date (newest first)
        const sortedData = [...this.attendanceData].sort((a, b) => new Date(b.date) - new Date(a.date));

        attendanceList.innerHTML = sortedData.slice(0, 10).map(record => `
            <div class="attendance-item ${record.status}">
                <div class="attendance-date">${this.formatDate(record.date)}</div>
                <div class="attendance-status-badge ${record.status}">${record.status.toUpperCase()}</div>
            </div>
        `).join('');
    }

    // Update attendance statistics
    updateAttendanceStats() {
        const totalDays = this.attendanceData.length;
        const presentDays = this.attendanceData.filter(record => record.status === 'present').length;
        const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

        const totalDaysEl = document.getElementById('total-days');
        const presentDaysEl = document.getElementById('present-days');
        const percentageEl = document.getElementById('attendance-percentage');

        if (totalDaysEl) totalDaysEl.textContent = totalDays;
        if (presentDaysEl) presentDaysEl.textContent = presentDays;
        if (percentageEl) percentageEl.textContent = `${attendancePercentage}%`;
    }

    // Start real-time updates
    startRealTimeUpdates() {
        if (typeof RealtimeListeners !== 'undefined' && this.currentStudent) {
            RealtimeListeners.listenToAttendance((snapshot) => {
                const changes = snapshot.docChanges();
                changes.forEach(change => {
                    if (change.type === 'added' || change.type === 'modified') {
                        const data = { id: change.doc.id, ...change.doc.data() };
                        if (data.studentId === this.currentStudent.id) {
                            this.updateAttendanceDisplay();
                            this.updateAttendanceStats();
                        }
                    }
                });
            });
        }
    }

    // Get current location (simplified)
    getCurrentLocation() {
        return 'School Campus'; // In a real app, you'd use geolocation API
    }

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Check if attendance can be marked today
    canMarkAttendanceToday() {
        const today = new Date().toISOString().split('T')[0];
        const existingRecord = this.attendanceData.find(record => 
            record.date === today && record.studentId === this.currentStudent.id
        );
        return !existingRecord;
    }

    // Update attendance status indicator
    updateStatusIndicator() {
        const indicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        
        if (!indicator || !statusText) return;

        const today = new Date().toISOString().split('T')[0];
        const todayRecord = this.attendanceData.find(record => 
            record.date === today && record.studentId === this.currentStudent.id
        );

        if (todayRecord) {
            indicator.className = `status-indicator ${todayRecord.status}`;
            statusText.textContent = `Marked ${todayRecord.status} today`;
        } else {
            indicator.className = 'status-indicator';
            statusText.textContent = 'Not marked today';
        }
    }
}

// Initialize student attendance manager
window.studentAttendanceManager = new StudentAttendanceManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StudentAttendanceManager;
}
