// Parent Dashboard Module
// Real-time parent dashboard with fees, attendance, and messages

class ParentDashboardManager {
    constructor() {
        this.currentParent = null;
        this.studentData = null;
        this.realtimeData = {
            fees: [],
            attendance: [],
            messages: [],
            announcements: []
        };
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for parent login
        if (window.ModuleEventBus) {
            window.ModuleEventBus.on('parentLogin', (parentData) => {
                this.currentParent = parentData;
                this.loadStudentData();
            });
        }

        // Listen for real-time updates
        if (window.ModuleEventBus) {
            window.ModuleEventBus.on('feeUpdate', (data) => {
                this.updateFeesDisplay(data);
            });
            window.ModuleEventBus.on('attendanceUpdate', (data) => {
                this.updateAttendanceDisplay(data);
            });
            window.ModuleEventBus.on('messageUpdate', (data) => {
                this.updateMessagesDisplay(data);
            });
        }
    }

    // Initialize parent dashboard
    init() {
        this.loadCurrentParent();
        this.setupParentUI();
        this.startRealTimeUpdates();
    }

    // Load current parent data
    loadCurrentParent() {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (user.role === 'parent') {
            this.currentParent = user;
        }
    }

    // Setup parent UI
    setupParentUI() {
        const parentSection = document.getElementById('parent-dashboard-section');
        if (!parentSection) return;

        parentSection.innerHTML = `
            <div class="parent-dashboard-container">
                <div class="parent-header">
                    <h2><i class="fas fa-users"></i> Parent Dashboard</h2>
                    <div class="parent-info">
                        <span class="parent-name">${this.currentParent?.fullName || 'Parent'}</span>
                        <span class="student-info" id="student-info">Loading student info...</span>
                    </div>
                </div>

                <div class="dashboard-grid">
                    <!-- Real-time Status Cards -->
                    <div class="status-cards">
                        <div class="status-card fees">
                            <div class="status-icon">
                                <i class="fas fa-rupee-sign"></i>
                            </div>
                            <div class="status-content">
                                <div class="status-title">Pending Fees</div>
                                <div class="status-value" id="pending-fees-amount">₹0</div>
                                <div class="status-trend" id="fees-trend">
                                    <i class="fas fa-arrow-up"></i> <span>Updated just now</span>
                                </div>
                            </div>
                        </div>

                        <div class="status-card attendance">
                            <div class="status-icon">
                                <i class="fas fa-calendar-check"></i>
                            </div>
                            <div class="status-content">
                                <div class="status-title">Attendance</div>
                                <div class="status-value" id="attendance-percentage">0%</div>
                                <div class="status-trend" id="attendance-trend">
                                    <i class="fas fa-clock"></i> <span>Last updated: Today</span>
                                </div>
                            </div>
                        </div>

                        <div class="status-card messages">
                            <div class="status-icon">
                                <i class="fas fa-envelope"></i>
                            </div>
                            <div class="status-content">
                                <div class="status-title">New Messages</div>
                                <div class="status-value" id="new-messages-count">0</div>
                                <div class="status-trend" id="messages-trend">
                                    <i class="fas fa-bell"></i> <span>Real-time updates</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Main Content Tabs -->
                    <div class="parent-tabs">
                        <button class="tab-btn active" onclick="parentDashboardManager.showTab('fees')">
                            <i class="fas fa-rupee-sign"></i> Fees
                        </button>
                        <button class="tab-btn" onclick="parentDashboardManager.showTab('attendance')">
                            <i class="fas fa-calendar-check"></i> Attendance
                        </button>
                        <button class="tab-btn" onclick="parentDashboardManager.showTab('messages')">
                            <i class="fas fa-envelope"></i> Messages
                        </button>
                        <button class="tab-btn" onclick="parentDashboardManager.showTab('announcements')">
                            <i class="fas fa-bullhorn"></i> Announcements
                        </button>
                    </div>

                    <!-- Fees Tab -->
                    <div id="fees-tab" class="tab-content active">
                        <div class="section-header">
                            <h3><i class="fas fa-rupee-sign"></i> Fee Management</h3>
                            <div class="fee-actions">
                                <button class="btn-pay" onclick="parentDashboardManager.openPaymentModal()">
                                    <i class="fas fa-credit-card"></i> Pay Fees
                                </button>
                                <button class="btn-download" onclick="parentDashboardManager.downloadFeeReceipt()">
                                    <i class="fas fa-download"></i> Download Receipt
                                </button>
                            </div>
                        </div>
                        
                        <div class="fees-overview">
                            <div class="fee-summary">
                                <div class="fee-item total">
                                    <div class="fee-label">Total Fees</div>
                                    <div class="fee-amount" id="total-fees">₹0</div>
                                </div>
                                <div class="fee-item paid">
                                    <div class="fee-label">Paid Amount</div>
                                    <div class="fee-amount" id="paid-fees">₹0</div>
                                </div>
                                <div class="fee-item pending">
                                    <div class="fee-label">Pending Amount</div>
                                    <div class="fee-amount" id="pending-fees">₹0</div>
                                </div>
                            </div>
                        </div>

                        <div class="fees-details">
                            <h4>Fee Details</h4>
                            <div class="fees-list" id="fees-list">
                                <div class="loading">Loading fee details...</div>
                            </div>
                        </div>
                    </div>

                    <!-- Attendance Tab -->
                    <div id="attendance-tab" class="tab-content">
                        <div class="section-header">
                            <h3><i class="fas fa-calendar-check"></i> Attendance Tracking</h3>
                            <div class="attendance-actions">
                                <button class="btn-export" onclick="parentDashboardManager.exportAttendance()">
                                    <i class="fas fa-download"></i> Export Report
                                </button>
                            </div>
                        </div>
                        
                        <div class="attendance-overview">
                            <div class="attendance-chart">
                                <canvas id="attendance-chart" width="400" height="200"></canvas>
                            </div>
                            <div class="attendance-stats">
                                <div class="stat-item">
                                    <div class="stat-label">Present Days</div>
                                    <div class="stat-value" id="present-days">0</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Absent Days</div>
                                    <div class="stat-value" id="absent-days">0</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Total Days</div>
                                    <div class="stat-value" id="total-days">0</div>
                                </div>
                            </div>
                        </div>

                        <div class="attendance-calendar">
                            <h4>Monthly Attendance</h4>
                            <div class="calendar-grid" id="attendance-calendar">
                                <div class="loading">Loading attendance calendar...</div>
                            </div>
                        </div>
                    </div>

                    <!-- Messages Tab -->
                    <div id="messages-tab" class="tab-content">
                        <div class="section-header">
                            <h3><i class="fas fa-envelope"></i> Messages</h3>
                            <button class="btn-compose" onclick="parentDashboardManager.openComposeModal()">
                                <i class="fas fa-plus"></i> Compose Message
                            </button>
                        </div>
                        
                        <div class="messages-list" id="messages-list">
                            <div class="loading">Loading messages...</div>
                        </div>
                    </div>

                    <!-- Announcements Tab -->
                    <div id="announcements-tab" class="tab-content">
                        <div class="section-header">
                            <h3><i class="fas fa-bullhorn"></i> School Announcements</h3>
                            <div class="announcement-filter">
                                <select id="announcement-filter" onchange="parentDashboardManager.filterAnnouncements()">
                                    <option value="all">All Announcements</option>
                                    <option value="urgent">Urgent Only</option>
                                    <option value="events">Events</option>
                                    <option value="academic">Academic</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="announcements-list" id="announcements-list">
                            <div class="loading">Loading announcements...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.addParentStyles();
        this.setupModals();
    }

    // Add CSS styles for parent dashboard
    addParentStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .parent-dashboard-container {
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                margin-bottom: 20px;
            }

            .parent-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 2px solid #f0f0f0;
            }

            .parent-header h2 {
                color: #1e293b;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .parent-info {
                text-align: right;
            }

            .parent-name {
                display: block;
                font-weight: 600;
                color: #1e293b;
                font-size: 16px;
            }

            .student-info {
                display: block;
                font-size: 14px;
                color: #64748b;
            }

            .dashboard-grid {
                display: flex;
                flex-direction: column;
                gap: 25px;
            }

            .status-cards {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 25px;
            }

            .status-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                padding: 20px;
                color: white;
                display: flex;
                align-items: center;
                gap: 15px;
                transition: transform 0.3s ease;
            }

            .status-card:hover {
                transform: translateY(-2px);
            }

            .status-card.fees {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }

            .status-card.attendance {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }

            .status-card.messages {
                background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            }

            .status-icon {
                font-size: 32px;
                opacity: 0.8;
            }

            .status-content {
                flex: 1;
            }

            .status-title {
                font-size: 14px;
                opacity: 0.9;
                margin-bottom: 5px;
            }

            .status-value {
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 5px;
            }

            .status-trend {
                font-size: 12px;
                opacity: 0.8;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .parent-tabs {
                display: flex;
                gap: 10px;
                margin-bottom: 25px;
                border-bottom: 2px solid #f0f0f0;
            }

            .tab-btn {
                padding: 12px 20px;
                border: none;
                background: none;
                cursor: pointer;
                border-bottom: 3px solid transparent;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 500;
                color: #64748b;
            }

            .tab-btn.active {
                color: #3b82f6;
                border-bottom-color: #3b82f6;
            }

            .tab-btn:hover {
                color: #3b82f6;
            }

            .tab-content {
                display: none;
            }

            .tab-content.active {
                display: block;
            }

            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #e2e8f0;
            }

            .section-header h3 {
                color: #374151;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .fee-actions, .attendance-actions {
                display: flex;
                gap: 10px;
            }

            .btn-pay, .btn-download, .btn-export, .btn-compose {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .btn-pay {
                background: #10b981;
                color: white;
            }

            .btn-download, .btn-export {
                background: #6b7280;
                color: white;
            }

            .btn-compose {
                background: #3b82f6;
                color: white;
            }

            .fees-overview {
                margin-bottom: 25px;
            }

            .fee-summary {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
            }

            .fee-item {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
            }

            .fee-item.total {
                border-left: 4px solid #3b82f6;
            }

            .fee-item.paid {
                border-left: 4px solid #10b981;
            }

            .fee-item.pending {
                border-left: 4px solid #ef4444;
            }

            .fee-label {
                font-size: 14px;
                color: #64748b;
                margin-bottom: 8px;
            }

            .fee-amount {
                font-size: 24px;
                font-weight: 700;
                color: #1e293b;
            }

            .fees-list {
                max-height: 400px;
                overflow-y: auto;
            }

            .fee-detail-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                margin-bottom: 10px;
                background: #f9fafb;
                border-radius: 8px;
                border-left: 4px solid #6b7280;
            }

            .fee-detail-item.paid {
                border-left-color: #10b981;
            }

            .fee-detail-item.pending {
                border-left-color: #ef4444;
            }

            .fee-detail-info {
                flex: 1;
            }

            .fee-detail-name {
                font-weight: 600;
                color: #1e293b;
                margin-bottom: 4px;
            }

            .fee-detail-description {
                font-size: 14px;
                color: #64748b;
            }

            .fee-detail-amount {
                font-weight: 700;
                color: #1e293b;
                margin-right: 10px;
            }

            .fee-detail-status {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
            }

            .fee-detail-status.paid {
                background: #d1fae5;
                color: #065f46;
            }

            .fee-detail-status.pending {
                background: #fee2e2;
                color: #991b1b;
            }

            .attendance-overview {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 25px;
                margin-bottom: 25px;
            }

            .attendance-chart {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
            }

            .attendance-stats {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .stat-item {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 15px;
                text-align: center;
            }

            .stat-label {
                font-size: 14px;
                color: #64748b;
                margin-bottom: 5px;
            }

            .stat-value {
                font-size: 20px;
                font-weight: 700;
                color: #1e293b;
            }

            .attendance-calendar {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
            }

            .calendar-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 8px;
                margin-top: 15px;
            }

            .calendar-day {
                aspect-ratio: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
            }

            .calendar-day.present {
                background: #d1fae5;
                color: #065f46;
            }

            .calendar-day.absent {
                background: #fee2e2;
                color: #991b1b;
            }

            .calendar-day.weekend {
                background: #f3f4f6;
                color: #9ca3af;
            }

            .calendar-day.today {
                border: 2px solid #3b82f6;
            }

            .messages-list {
                max-height: 500px;
                overflow-y: auto;
            }

            .message-item {
                display: flex;
                gap: 15px;
                padding: 15px;
                margin-bottom: 10px;
                background: #f9fafb;
                border-radius: 8px;
                border-left: 4px solid #3b82f6;
            }

            .message-item.unread {
                background: #eff6ff;
                border-left-color: #1d4ed8;
            }

            .message-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: #3b82f6;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 600;
            }

            .message-content {
                flex: 1;
            }

            .message-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 5px;
            }

            .message-sender {
                font-weight: 600;
                color: #1e293b;
            }

            .message-time {
                font-size: 12px;
                color: #64748b;
            }

            .message-text {
                color: #374151;
                line-height: 1.4;
            }

            .announcements-list {
                max-height: 500px;
                overflow-y: auto;
            }

            .announcement-item {
                padding: 20px;
                margin-bottom: 15px;
                background: #f9fafb;
                border-radius: 8px;
                border-left: 4px solid #6b7280;
            }

            .announcement-item.urgent {
                border-left-color: #ef4444;
                background: #fef2f2;
            }

            .announcement-item.event {
                border-left-color: #10b981;
                background: #f0fdf4;
            }

            .announcement-item.academic {
                border-left-color: #3b82f6;
                background: #eff6ff;
            }

            .announcement-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }

            .announcement-title {
                font-weight: 600;
                color: #1e293b;
                font-size: 16px;
            }

            .announcement-date {
                font-size: 12px;
                color: #64748b;
            }

            .announcement-content {
                color: #374151;
                line-height: 1.5;
            }

            .announcement-filter select {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                background: white;
            }

            .loading {
                text-align: center;
                padding: 40px;
                color: #6b7280;
            }

            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }

            .modal-content {
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #e2e8f0;
            }

            .modal-header h3 {
                color: #1e293b;
                margin: 0;
            }

            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6b7280;
            }

            .modal-body {
                margin-bottom: 20px;
            }

            .modal-footer {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }

            .btn-cancel {
                padding: 8px 16px;
                border: 1px solid #d1d5db;
                background: white;
                color: #374151;
                border-radius: 6px;
                cursor: pointer;
            }

            .btn-submit {
                padding: 8px 16px;
                border: none;
                background: #3b82f6;
                color: white;
                border-radius: 6px;
                cursor: pointer;
            }

            .form-group {
                margin-bottom: 15px;
            }

            .form-group label {
                display: block;
                font-size: 14px;
                font-weight: 500;
                color: #374151;
                margin-bottom: 5px;
            }

            .form-group input, .form-group textarea, .form-group select {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
            }

            .form-group textarea {
                resize: vertical;
                min-height: 80px;
            }
        `;
        document.head.appendChild(style);
    }

    // Setup modals
    setupModals() {
        // Payment Modal
        const paymentModal = document.createElement('div');
        paymentModal.id = 'payment-modal';
        paymentModal.className = 'modal';
        paymentModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Pay Fees</h3>
                    <button class="modal-close" onclick="parentDashboardManager.closeModal('payment-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="payment-methods">
                        <h4>Select Payment Method</h4>
                        <div class="payment-options">
                            <button class="payment-option" onclick="parentDashboardManager.selectPaymentMethod('upi')">
                                <i class="fas fa-qrcode"></i> UPI QR Code
                            </button>
                            <button class="payment-option" onclick="parentDashboardManager.selectPaymentMethod('card')">
                                <i class="fas fa-credit-card"></i> Credit/Debit Card
                            </button>
                            <button class="payment-option" onclick="parentDashboardManager.selectPaymentMethod('netbanking')">
                                <i class="fas fa-university"></i> Net Banking
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Compose Message Modal
        const composeModal = document.createElement('div');
        composeModal.id = 'compose-modal';
        composeModal.className = 'modal';
        composeModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Compose Message</h3>
                    <button class="modal-close" onclick="parentDashboardManager.closeModal('compose-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="compose-form">
                        <div class="form-group">
                            <label>To</label>
                            <select id="message-recipient" required>
                                <option value="">Select recipient</option>
                                <option value="teacher">Class Teacher</option>
                                <option value="principal">Principal</option>
                                <option value="admin">Administration</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Subject</label>
                            <input type="text" id="message-subject" required>
                        </div>
                        <div class="form-group">
                            <label>Message</label>
                            <textarea id="message-content" required></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="parentDashboardManager.closeModal('compose-modal')">Cancel</button>
                    <button class="btn-submit" onclick="parentDashboardManager.sendMessage()">Send Message</button>
                </div>
            </div>
        `;

        document.body.appendChild(paymentModal);
        document.body.appendChild(composeModal);
    }

    // Load student data
    async loadStudentData() {
        if (!this.currentParent) return;

        try {
            // Find student by roll number
            const students = JSON.parse(localStorage.getItem('registeredStudents') || '[]');
            this.studentData = students.find(s => s.studentRollNumber === this.currentParent.studentRollNumber);
            
            if (this.studentData) {
                document.getElementById('student-info').textContent = 
                    `${this.studentData.firstName} ${this.studentData.lastName} - Class ${this.studentData.class}`;
                
                this.loadFeesData();
                this.loadAttendanceData();
                this.loadMessagesData();
                this.loadAnnouncementsData();
            }
        } catch (error) {
            console.error('Error loading student data:', error);
        }
    }

    // Load fees data
    async loadFeesData() {
        if (!this.studentData) return;

        try {
            const fees = JSON.parse(localStorage.getItem(`fees_${this.studentData.id}`) || '[]');
            this.realtimeData.fees = fees;
            this.updateFeesDisplay();
        } catch (error) {
            console.error('Error loading fees data:', error);
        }
    }

    // Load attendance data
    async loadAttendanceData() {
        if (!this.studentData) return;

        try {
            const attendance = JSON.parse(localStorage.getItem(`attendance_${this.studentData.id}`) || '[]');
            this.realtimeData.attendance = attendance;
            this.updateAttendanceDisplay();
        } catch (error) {
            console.error('Error loading attendance data:', error);
        }
    }

    // Load messages data
    async loadMessagesData() {
        if (!this.studentData) return;

        try {
            const messages = JSON.parse(localStorage.getItem(`messages_${this.studentData.id}`) || '[]');
            this.realtimeData.messages = messages;
            this.updateMessagesDisplay();
        } catch (error) {
            console.error('Error loading messages data:', error);
        }
    }

    // Load announcements data
    async loadAnnouncementsData() {
        try {
            const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
            this.realtimeData.announcements = announcements;
            this.updateAnnouncementsDisplay();
        } catch (error) {
            console.error('Error loading announcements data:', error);
        }
    }

    // Update fees display
    updateFeesDisplay() {
        const fees = this.realtimeData.fees;
        const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
        const paidFees = fees.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0);
        const pendingFees = totalFees - paidFees;

        // Update status cards
        document.getElementById('pending-fees-amount').textContent = `₹${pendingFees}`;
        document.getElementById('total-fees').textContent = `₹${totalFees}`;
        document.getElementById('paid-fees').textContent = `₹${paidFees}`;
        document.getElementById('pending-fees').textContent = `₹${pendingFees}`;

        // Update fees list
        const feesList = document.getElementById('fees-list');
        if (feesList) {
            if (fees.length === 0) {
                feesList.innerHTML = '<div class="loading">No fee records found</div>';
                return;
            }

            feesList.innerHTML = fees.map(fee => `
                <div class="fee-detail-item ${fee.status}">
                    <div class="fee-detail-info">
                        <div class="fee-detail-name">${fee.name}</div>
                        <div class="fee-detail-description">${fee.description || 'School Fee'}</div>
                    </div>
                    <div class="fee-detail-amount">₹${fee.amount}</div>
                    <div class="fee-detail-status ${fee.status}">${fee.status.toUpperCase()}</div>
                </div>
            `).join('');
        }
    }

    // Update attendance display
    updateAttendanceDisplay() {
        const attendance = this.realtimeData.attendance;
        const totalDays = attendance.length;
        const presentDays = attendance.filter(record => record.status === 'present').length;
        const absentDays = totalDays - presentDays;
        const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

        // Update status cards
        document.getElementById('attendance-percentage').textContent = `${attendancePercentage}%`;
        document.getElementById('present-days').textContent = presentDays;
        document.getElementById('absent-days').textContent = absentDays;
        document.getElementById('total-days').textContent = totalDays;

        // Update calendar
        this.updateAttendanceCalendar();
    }

    // Update attendance calendar
    updateAttendanceCalendar() {
        const calendarEl = document.getElementById('attendance-calendar');
        if (!calendarEl) return;

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();

        let calendarHTML = '';
        
        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            calendarHTML += `<div class="calendar-day" style="font-weight: 600; color: #64748b;">${day}</div>`;
        });

        // Add empty cells for first day
        for (let i = 0; i < firstDay; i++) {
            calendarHTML += '<div class="calendar-day"></div>';
        }

        // Add days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const attendanceRecord = this.realtimeData.attendance.find(record => record.date === dateStr);
            
            let dayClass = 'calendar-day';
            if (day === today.getDate()) {
                dayClass += ' today';
            }
            
            if (attendanceRecord) {
                dayClass += ` ${attendanceRecord.status}`;
            } else if (new Date(currentYear, currentMonth, day).getDay() === 0 || new Date(currentYear, currentMonth, day).getDay() === 6) {
                dayClass += ' weekend';
            }
            
            calendarHTML += `<div class="${dayClass}">${day}</div>`;
        }

        calendarEl.innerHTML = calendarHTML;
    }

    // Update messages display
    updateMessagesDisplay() {
        const messages = this.realtimeData.messages;
        const newMessages = messages.filter(msg => !msg.read).length;

        // Update status cards
        document.getElementById('new-messages-count').textContent = newMessages;

        // Update messages list
        const messagesList = document.getElementById('messages-list');
        if (messagesList) {
            if (messages.length === 0) {
                messagesList.innerHTML = '<div class="loading">No messages found</div>';
                return;
            }

            messagesList.innerHTML = messages.slice(0, 10).map(message => `
                <div class="message-item ${message.read ? '' : 'unread'}">
                    <div class="message-avatar">
                        ${message.sender.charAt(0).toUpperCase()}
                    </div>
                    <div class="message-content">
                        <div class="message-header">
                            <div class="message-sender">${message.sender}</div>
                            <div class="message-time">${this.formatTime(message.timestamp)}</div>
                        </div>
                        <div class="message-text">${message.content}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    // Update announcements display
    updateAnnouncementsDisplay() {
        const announcements = this.realtimeData.announcements;
        const announcementsList = document.getElementById('announcements-list');
        
        if (announcementsList) {
            if (announcements.length === 0) {
                announcementsList.innerHTML = '<div class="loading">No announcements found</div>';
                return;
            }

            announcementsList.innerHTML = announcements.map(announcement => `
                <div class="announcement-item ${announcement.type}">
                    <div class="announcement-header">
                        <div class="announcement-title">${announcement.title}</div>
                        <div class="announcement-date">${this.formatDate(announcement.date)}</div>
                    </div>
                    <div class="announcement-content">${announcement.content}</div>
                </div>
            `).join('');
        }
    }

    // Show tab
    showTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(`${tabName}-tab`).classList.add('active');
        event.target.classList.add('active');
    }

    // Start real-time updates
    startRealTimeUpdates() {
        // Simulate real-time updates every 30 seconds
        setInterval(() => {
            this.loadFeesData();
            this.loadAttendanceData();
            this.loadMessagesData();
            this.loadAnnouncementsData();
        }, 30000);
    }

    // Open payment modal
    openPaymentModal() {
        document.getElementById('payment-modal').style.display = 'flex';
    }

    // Open compose modal
    openComposeModal() {
        document.getElementById('compose-modal').style.display = 'flex';
    }

    // Close modal
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    // Select payment method
    selectPaymentMethod(method) {
        if (window.notificationManager) {
            window.notificationManager.info(`Redirecting to ${method} payment...`);
        }
        this.closeModal('payment-modal');
    }

    // Send message
    async sendMessage() {
        const recipient = document.getElementById('message-recipient').value;
        const subject = document.getElementById('message-subject').value;
        const content = document.getElementById('message-content').value;

        if (!recipient || !subject || !content) {
            if (window.notificationManager) {
                window.notificationManager.warning('Please fill in all fields');
            }
            return;
        }

        const message = {
            id: 'MSG' + Date.now(),
            sender: this.currentParent.fullName || 'Parent',
            recipient: recipient,
            subject: subject,
            content: content,
            timestamp: new Date().toISOString(),
            read: false
        };

        try {
            // Save message
            const messages = JSON.parse(localStorage.getItem(`messages_${this.studentData.id}`) || '[]');
            messages.push(message);
            localStorage.setItem(`messages_${this.studentData.id}`, JSON.stringify(messages));

            if (window.notificationManager) {
                window.notificationManager.success('Message sent successfully!');
            }

            this.closeModal('compose-modal');
            this.loadMessagesData();

        } catch (error) {
            console.error('Error sending message:', error);
            if (window.notificationManager) {
                window.notificationManager.error('Failed to send message');
            }
        }
    }

    // Download fee receipt
    downloadFeeReceipt() {
        if (window.notificationManager) {
            window.notificationManager.info('Generating fee receipt...');
        }
        // In real app, generate and download PDF receipt
    }

    // Export attendance
    exportAttendance() {
        if (window.notificationManager) {
            window.notificationManager.info('Exporting attendance report...');
        }
        // In real app, generate and download attendance report
    }

    // Filter announcements
    filterAnnouncements() {
        const filter = document.getElementById('announcement-filter').value;
        let filteredAnnouncements = this.realtimeData.announcements;

        if (filter !== 'all') {
            filteredAnnouncements = this.realtimeData.announcements.filter(announcement => 
                announcement.type === filter || announcement.priority === filter
            );
        }

        const announcementsList = document.getElementById('announcements-list');
        if (announcementsList) {
            announcementsList.innerHTML = filteredAnnouncements.map(announcement => `
                <div class="announcement-item ${announcement.type}">
                    <div class="announcement-header">
                        <div class="announcement-title">${announcement.title}</div>
                        <div class="announcement-date">${this.formatDate(announcement.date)}</div>
                    </div>
                    <div class="announcement-content">${announcement.content}</div>
                </div>
            `).join('');
        }
    }

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Format time
    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Initialize parent dashboard manager
window.parentDashboardManager = new ParentDashboardManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParentDashboardManager;
}


