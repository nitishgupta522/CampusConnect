// Attendance Management Module for Admin Dashboard
// Handles attendance tracking, reporting, and management

class AttendanceManager {
    constructor() {
        this.attendanceData = [];
        this.students = [];
        this.currentFilter = {
            class: 'all',
            section: 'all',
            dateRange: 'today',
            status: 'all'
        };
        this.init();
    }

    init() {
        this.loadStudents();
        this.loadAttendanceData();
        this.setupEventListeners();
    }

    // Load students data
    async loadStudents() {
        try {
            if (typeof DatabaseHelper !== 'undefined') {
                this.students = await DatabaseHelper.getAllStudents();
            } else {
                // Fallback to localStorage
                this.students = JSON.parse(localStorage.getItem('registeredStudents') || '[]');
            }
        } catch (error) {
            console.error('Error loading students:', error);
            this.students = [];
        }
    }

    // Load attendance data
    async loadAttendanceData() {
        try {
            if (typeof DatabaseHelper !== 'undefined') {
                // Load from Firebase
                const snapshot = await db.collection('attendance')
                    .orderBy('timestamp', 'desc')
                    .limit(1000)
                    .get();
                this.attendanceData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else {
                // Fallback to localStorage
                const allAttendance = [];
                this.students.forEach(student => {
                    const studentAttendance = JSON.parse(localStorage.getItem(`attendance_${student.id}`) || '[]');
                    allAttendance.push(...studentAttendance);
                });
                this.attendanceData = allAttendance;
            }
        } catch (error) {
            console.error('Error loading attendance data:', error);
            this.attendanceData = [];
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for real-time updates
        if (typeof RealtimeListeners !== 'undefined') {
            RealtimeListeners.listenToAttendance((snapshot) => {
                const changes = snapshot.docChanges();
                changes.forEach(change => {
                    if (change.type === 'added' || change.type === 'modified') {
                        const data = { id: change.doc.id, ...change.doc.data() };
                        this.updateAttendanceData(data);
                    }
                });
            });
        }
    }

    // Update attendance data
    updateAttendanceData(newData) {
        const existingIndex = this.attendanceData.findIndex(item => item.id === newData.id);
        if (existingIndex >= 0) {
            this.attendanceData[existingIndex] = newData;
        } else {
            this.attendanceData.unshift(newData);
        }
        this.renderAttendanceTable();
    }

    // Render attendance management interface
    renderAttendanceInterface() {
        return `
            <div class="attendance-management-container">
                <div class="attendance-header">
                    <h2><i class="fas fa-calendar-check"></i> Attendance Management</h2>
                    <div class="attendance-actions">
                        <button class="btn-primary" onclick="attendanceManager.openBulkAttendanceModal()">
                            <i class="fas fa-users"></i> Bulk Mark Attendance
                        </button>
                        <button class="btn-secondary" onclick="attendanceManager.exportAttendanceReport()">
                            <i class="fas fa-download"></i> Export Report
                        </button>
                    </div>
                </div>

                <div class="attendance-filters">
                    <div class="filter-group">
                        <label>Class:</label>
                        <select id="classFilter" onchange="attendanceManager.filterAttendance()">
                            <option value="all">All Classes</option>
                            <option value="9">Class 9</option>
                            <option value="10">Class 10</option>
                            <option value="11">Class 11</option>
                            <option value="12">Class 12</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Section:</label>
                        <select id="sectionFilter" onchange="attendanceManager.filterAttendance()">
                            <option value="all">All Sections</option>
                            <option value="A">Section A</option>
                            <option value="B">Section B</option>
                            <option value="C">Section C</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Date Range:</label>
                        <select id="dateRangeFilter" onchange="attendanceManager.filterAttendance()">
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Status:</label>
                        <select id="statusFilter" onchange="attendanceManager.filterAttendance()">
                            <option value="all">All Status</option>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                        </select>
                    </div>
                </div>

                <div class="attendance-stats">
                    <div class="stat-card">
                        <div class="stat-value" id="totalStudents">0</div>
                        <div class="stat-label">Total Students</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="presentToday">0</div>
                        <div class="stat-label">Present Today</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="absentToday">0</div>
                        <div class="stat-label">Absent Today</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="attendancePercentage">0%</div>
                        <div class="stat-label">Attendance %</div>
                    </div>
                </div>

                <div class="attendance-table-container">
                    <table class="attendance-table" id="attendanceTable">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Roll No.</th>
                                <th>Class</th>
                                <th>Section</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Marked By</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="attendanceTableBody">
                            <tr>
                                <td colspan="8" class="loading">Loading attendance data...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="attendance-charts">
                    <div class="chart-container">
                        <h3>Daily Attendance Trend</h3>
                        <canvas id="dailyAttendanceChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3>Class-wise Attendance</h3>
                        <canvas id="classAttendanceChart"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    // Render attendance table
    renderAttendanceTable() {
        const tbody = document.getElementById('attendanceTableBody');
        if (!tbody) return;

        const filteredData = this.getFilteredAttendanceData();

        if (filteredData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="no-data">No attendance records found</td></tr>';
            return;
        }

        tbody.innerHTML = filteredData.map(record => `
            <tr>
                <td>${record.studentName || 'N/A'}</td>
                <td>${record.rollNumber || 'N/A'}</td>
                <td>${record.class || 'N/A'}</td>
                <td>${record.section || 'N/A'}</td>
                <td>${this.formatDate(record.date)}</td>
                <td>
                    <span class="status-badge ${record.status}">
                        ${record.status.toUpperCase()}
                    </span>
                </td>
                <td>${record.markedBy || 'System'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="attendanceManager.editAttendance('${record.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="attendanceManager.deleteAttendance('${record.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updateAttendanceStats();
    }

    // Get filtered attendance data
    getFilteredAttendanceData() {
        let filtered = [...this.attendanceData];

        // Filter by class
        if (this.currentFilter.class !== 'all') {
            filtered = filtered.filter(record => record.class === this.currentFilter.class);
        }

        // Filter by section
        if (this.currentFilter.section !== 'all') {
            filtered = filtered.filter(record => record.section === this.currentFilter.section);
        }

        // Filter by status
        if (this.currentFilter.status !== 'all') {
            filtered = filtered.filter(record => record.status === this.currentFilter.status);
        }

        // Filter by date range
        const today = new Date().toISOString().split('T')[0];
        switch (this.currentFilter.dateRange) {
            case 'today':
                filtered = filtered.filter(record => record.date === today);
                break;
            case 'week':
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                filtered = filtered.filter(record => record.date >= weekAgo);
                break;
            case 'month':
                const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                filtered = filtered.filter(record => record.date >= monthAgo);
                break;
        }

        return filtered;
    }

    // Update attendance statistics
    updateAttendanceStats() {
        const filteredData = this.getFilteredAttendanceData();
        const today = new Date().toISOString().split('T')[0];
        const todayData = filteredData.filter(record => record.date === today);

        const totalStudents = this.students.length;
        const presentToday = todayData.filter(record => record.status === 'present').length;
        const absentToday = todayData.filter(record => record.status === 'absent').length;
        const attendancePercentage = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;

        const totalStudentsEl = document.getElementById('totalStudents');
        const presentTodayEl = document.getElementById('presentToday');
        const absentTodayEl = document.getElementById('absentToday');
        const attendancePercentageEl = document.getElementById('attendancePercentage');

        if (totalStudentsEl) totalStudentsEl.textContent = totalStudents;
        if (presentTodayEl) presentTodayEl.textContent = presentToday;
        if (absentTodayEl) absentTodayEl.textContent = absentToday;
        if (attendancePercentageEl) attendancePercentageEl.textContent = `${attendancePercentage}%`;
    }

    // Filter attendance data
    filterAttendance() {
        this.currentFilter.class = document.getElementById('classFilter')?.value || 'all';
        this.currentFilter.section = document.getElementById('sectionFilter')?.value || 'all';
        this.currentFilter.dateRange = document.getElementById('dateRangeFilter')?.value || 'today';
        this.currentFilter.status = document.getElementById('statusFilter')?.value || 'all';

        this.renderAttendanceTable();
        this.renderCharts();
    }

    // Open bulk attendance modal
    openBulkAttendanceModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content bulk-attendance-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-users"></i> Bulk Mark Attendance</h3>
                    <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Select Class:</label>
                        <select id="bulkClass" required>
                            <option value="">Select Class</option>
                            <option value="9">Class 9</option>
                            <option value="10">Class 10</option>
                            <option value="11">Class 11</option>
                            <option value="12">Class 12</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Select Section:</label>
                        <select id="bulkSection" required>
                            <option value="">Select Section</option>
                            <option value="A">Section A</option>
                            <option value="B">Section B</option>
                            <option value="C">Section C</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Date:</label>
                        <input type="date" id="bulkDate" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="students-list" id="bulkStudentsList">
                        <div class="loading">Select class and section to load students...</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Cancel</button>
                    <button class="btn-primary" onclick="attendanceManager.submitBulkAttendance()">Mark Attendance</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Add event listeners for class/section change
        document.getElementById('bulkClass').addEventListener('change', () => {
            this.loadStudentsForBulk();
        });
        document.getElementById('bulkSection').addEventListener('change', () => {
            this.loadStudentsForBulk();
        });
    }

    // Load students for bulk attendance
    loadStudentsForBulk() {
        const classValue = document.getElementById('bulkClass')?.value;
        const sectionValue = document.getElementById('bulkSection')?.value;
        const studentsList = document.getElementById('bulkStudentsList');

        if (!classValue || !sectionValue) {
            studentsList.innerHTML = '<div class="loading">Select class and section to load students...</div>';
            return;
        }

        const filteredStudents = this.students.filter(student => 
            student.class === classValue && student.section === sectionValue
        );

        if (filteredStudents.length === 0) {
            studentsList.innerHTML = '<div class="no-data">No students found for the selected class and section</div>';
            return;
        }

        studentsList.innerHTML = `
            <h4>Students in Class ${classValue}${sectionValue}</h4>
            <div class="bulk-attendance-grid">
                ${filteredStudents.map(student => `
                    <div class="student-attendance-item">
                        <div class="student-info">
                            <span class="student-name">${student.name || student.fullName}</span>
                            <span class="student-roll">Roll: ${student.rollNumber || student.studentRollNumber}</span>
                        </div>
                        <div class="attendance-options">
                            <label>
                                <input type="radio" name="attendance_${student.id}" value="present" checked>
                                Present
                            </label>
                            <label>
                                <input type="radio" name="attendance_${student.id}" value="absent">
                                Absent
                            </label>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Submit bulk attendance
    async submitBulkAttendance() {
        const classValue = document.getElementById('bulkClass')?.value;
        const sectionValue = document.getElementById('bulkSection')?.value;
        const dateValue = document.getElementById('bulkDate')?.value;

        if (!classValue || !sectionValue || !dateValue) {
            alert('Please fill all required fields');
            return;
        }

        const attendanceRecords = [];
        const studentsList = document.getElementById('bulkStudentsList');
        const studentItems = studentsList.querySelectorAll('.student-attendance-item');

        studentItems.forEach(item => {
            const studentName = item.querySelector('.student-name').textContent;
            const studentRoll = item.querySelector('.student-roll').textContent.replace('Roll: ', '');
            const statusInput = item.querySelector('input[name^="attendance_"]:checked');
            
            if (statusInput) {
                attendanceRecords.push({
                    studentId: statusInput.name.replace('attendance_', ''),
                    studentName: studentName,
                    rollNumber: studentRoll,
                    class: classValue,
                    section: sectionValue,
                    status: statusInput.value,
                    date: dateValue,
                    timestamp: new Date().toISOString(),
                    markedBy: 'admin'
                });
            }
        });

        if (attendanceRecords.length === 0) {
            alert('No attendance records to submit');
            return;
        }

        try {
            // Save to database
            for (const record of attendanceRecords) {
                if (typeof DatabaseHelper !== 'undefined') {
                    await DatabaseHelper.markAttendance(record);
                } else {
                    // Fallback to localStorage
                    const existingAttendance = JSON.parse(localStorage.getItem(`attendance_${record.studentId}`) || '[]');
                    existingAttendance.push(record);
                    localStorage.setItem(`attendance_${record.studentId}`, JSON.stringify(existingAttendance));
                }
            }

            // Update local data
            this.attendanceData.unshift(...attendanceRecords);
            this.renderAttendanceTable();

            alert(`Attendance marked successfully for ${attendanceRecords.length} students`);
            
            // Close modal
            document.querySelector('.bulk-attendance-modal').parentElement.remove();

        } catch (error) {
            console.error('Error submitting bulk attendance:', error);
            alert('Error marking attendance. Please try again.');
        }
    }

    // Edit attendance record
    editAttendance(recordId) {
        const record = this.attendanceData.find(r => r.id === recordId);
        if (!record) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Edit Attendance</h3>
                    <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Student:</label>
                        <input type="text" value="${record.studentName}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Date:</label>
                        <input type="date" id="editDate" value="${record.date}">
                    </div>
                    <div class="form-group">
                        <label>Status:</label>
                        <select id="editStatus">
                            <option value="present" ${record.status === 'present' ? 'selected' : ''}>Present</option>
                            <option value="absent" ${record.status === 'absent' ? 'selected' : ''}>Absent</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Cancel</button>
                    <button class="btn-primary" onclick="attendanceManager.updateAttendance('${recordId}')">Update</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Update attendance record
    async updateAttendance(recordId) {
        const date = document.getElementById('editDate')?.value;
        const status = document.getElementById('editStatus')?.value;

        if (!date || !status) {
            alert('Please fill all fields');
            return;
        }

        try {
            const record = this.attendanceData.find(r => r.id === recordId);
            if (!record) return;

            const updatedRecord = { ...record, date, status };

            if (typeof DatabaseHelper !== 'undefined') {
                await db.collection('attendance').doc(recordId).update(updatedRecord);
            } else {
                // Update in localStorage
                const studentAttendance = JSON.parse(localStorage.getItem(`attendance_${record.studentId}`) || '[]');
                const index = studentAttendance.findIndex(r => r.id === recordId);
                if (index >= 0) {
                    studentAttendance[index] = updatedRecord;
                    localStorage.setItem(`attendance_${record.studentId}`, JSON.stringify(studentAttendance));
                }
            }

            // Update local data
            const index = this.attendanceData.findIndex(r => r.id === recordId);
            if (index >= 0) {
                this.attendanceData[index] = updatedRecord;
            }

            this.renderAttendanceTable();
            alert('Attendance updated successfully');

            // Close modal
            document.querySelector('.modal').remove();

        } catch (error) {
            console.error('Error updating attendance:', error);
            alert('Error updating attendance. Please try again.');
        }
    }

    // Delete attendance record
    async deleteAttendance(recordId) {
        if (!confirm('Are you sure you want to delete this attendance record?')) {
            return;
        }

        try {
            const record = this.attendanceData.find(r => r.id === recordId);
            if (!record) return;

            if (typeof DatabaseHelper !== 'undefined') {
                await db.collection('attendance').doc(recordId).delete();
            } else {
                // Remove from localStorage
                const studentAttendance = JSON.parse(localStorage.getItem(`attendance_${record.studentId}`) || '[]');
                const filtered = studentAttendance.filter(r => r.id !== recordId);
                localStorage.setItem(`attendance_${record.studentId}`, JSON.stringify(filtered));
            }

            // Remove from local data
            this.attendanceData = this.attendanceData.filter(r => r.id !== recordId);
            this.renderAttendanceTable();

            alert('Attendance record deleted successfully');

        } catch (error) {
            console.error('Error deleting attendance:', error);
            alert('Error deleting attendance record. Please try again.');
        }
    }

    // Export attendance report
    exportAttendanceReport() {
        const filteredData = this.getFilteredAttendanceData();
        
        if (filteredData.length === 0) {
            alert('No data to export');
            return;
        }

        const csvData = filteredData.map(record => ({
            'Student Name': record.studentName,
            'Roll Number': record.rollNumber,
            'Class': record.class,
            'Section': record.section,
            'Date': record.date,
            'Status': record.status,
            'Marked By': record.markedBy,
            'Timestamp': record.timestamp
        }));

        DashboardUtils.exportToCSV(csvData, `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
    }

    // Render charts
    renderCharts() {
        this.renderDailyAttendanceChart();
        this.renderClassAttendanceChart();
    }

    // Render daily attendance chart
    renderDailyAttendanceChart() {
        const canvas = document.getElementById('dailyAttendanceChart');
        if (!canvas || typeof Chart === 'undefined') return;

        const last7Days = [];
        const presentData = [];
        const absentData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            last7Days.push(date);
            
            const dayData = this.attendanceData.filter(record => record.date === date);
            presentData.push(dayData.filter(record => record.status === 'present').length);
            absentData.push(dayData.filter(record => record.status === 'absent').length);
        }

        new Chart(canvas, {
            type: 'line',
            data: {
                labels: last7Days.map(date => this.formatDate(date)),
                datasets: [{
                    label: 'Present',
                    data: presentData,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    tension: 0.1
                }, {
                    label: 'Absent',
                    data: absentData,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Daily Attendance Trend (Last 7 Days)'
                    }
                }
            }
        });
    }

    // Render class attendance chart
    renderClassAttendanceChart() {
        const canvas = document.getElementById('classAttendanceChart');
        if (!canvas || typeof Chart === 'undefined') return;

        const classData = {};
        this.attendanceData.forEach(record => {
            if (!classData[record.class]) {
                classData[record.class] = { present: 0, absent: 0 };
            }
            if (record.status === 'present') {
                classData[record.class].present++;
            } else if (record.status === 'absent') {
                classData[record.class].absent++;
            }
        });

        const classes = Object.keys(classData);
        const presentData = classes.map(cls => classData[cls].present);
        const absentData = classes.map(cls => classData[cls].absent);

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: classes.map(cls => `Class ${cls}`),
                datasets: [{
                    label: 'Present',
                    data: presentData,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }, {
                    label: 'Absent',
                    data: absentData,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Class-wise Attendance'
                    }
                }
            }
        });
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

    // Add CSS styles
    addStyles() {
        if (document.getElementById('attendance-management-styles')) return;

        const style = document.createElement('style');
        style.id = 'attendance-management-styles';
        style.textContent = `
            .attendance-management-container {
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
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 2px solid #f0f0f0;
            }

            .attendance-header h2 {
                color: #1e293b;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .attendance-actions {
                display: flex;
                gap: 10px;
            }

            .attendance-filters {
                display: flex;
                gap: 20px;
                margin-bottom: 25px;
                padding: 20px;
                background: #f8fafc;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
            }

            .filter-group {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }

            .filter-group label {
                font-weight: 500;
                color: #374151;
                font-size: 14px;
            }

            .filter-group select {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                background: white;
                font-size: 14px;
            }

            .attendance-stats {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 15px;
                margin-bottom: 25px;
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

            .attendance-table-container {
                overflow-x: auto;
                margin-bottom: 25px;
            }

            .attendance-table {
                width: 100%;
                border-collapse: collapse;
                background: white;
            }

            .attendance-table th,
            .attendance-table td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #e2e8f0;
            }

            .attendance-table th {
                background: #f8fafc;
                font-weight: 600;
                color: #374151;
            }

            .status-badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
            }

            .status-badge.present {
                background: #d1fae5;
                color: #065f46;
            }

            .status-badge.absent {
                background: #fee2e2;
                color: #991b1b;
            }

            .action-buttons {
                display: flex;
                gap: 5px;
            }

            .btn-edit, .btn-delete {
                padding: 6px 10px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            }

            .btn-edit {
                background: #3b82f6;
                color: white;
            }

            .btn-delete {
                background: #ef4444;
                color: white;
            }

            .attendance-charts {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }

            .chart-container {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
            }

            .chart-container h3 {
                margin: 0 0 15px 0;
                color: #374151;
            }

            .bulk-attendance-modal {
                max-width: 800px;
            }

            .bulk-attendance-grid {
                display: grid;
                gap: 15px;
                max-height: 400px;
                overflow-y: auto;
            }

            .student-attendance-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: #f8fafc;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
            }

            .student-info {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            .student-name {
                font-weight: 600;
                color: #1e293b;
            }

            .student-roll {
                font-size: 12px;
                color: #64748b;
            }

            .attendance-options {
                display: flex;
                gap: 15px;
            }

            .attendance-options label {
                display: flex;
                align-items: center;
                gap: 5px;
                cursor: pointer;
            }

            .loading, .no-data {
                text-align: center;
                padding: 20px;
                color: #6b7280;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize attendance manager
window.attendanceManager = new AttendanceManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AttendanceManager;
}
