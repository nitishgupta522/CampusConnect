// Enhanced Admin Dashboard with Error Corrections and Improvements
class AdminDashboard {
    constructor() {
        this.currentUser = null;
        this.dashboardData = {};
        this.charts = {};
        this.init();
    }

    init() {
        this.loadDashboardData();
        this.setupEventListeners();
        this.renderDashboard();
    }

    // Load sample/demo data with proper structure
    loadDashboardData() {
        this.dashboardData = {
            stats: {
                totalStudents: { value: 1234, change: 12, period: 'this month' },
                facultyMembers: { value: 89, change: 3, period: 'this month' },
                feeCollection: { value: 2850000, change: 8.2, period: 'this month' },
                avgAttendance: { value: 92.5, change: 2.1, period: 'this month' }
            },
            recentActivities: [
                { 
                    id: 1, 
                    type: 'admission', 
                    message: 'New student admitted: Aarav Patel (Class 12A)', 
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    user: 'Admission Office'
                },
                { 
                    id: 2, 
                    type: 'payment', 
                    message: 'Fee payment received: ₹15,000 from Meera Singh', 
                    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                    user: 'Accounts Department'
                },
                { 
                    id: 3, 
                    type: 'attendance', 
                    message: 'Attendance marked: Class 11B - 95% present', 
                    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
                    user: 'Mrs. Priya Sharma'
                }
            ],
            announcements: [
                {
                    id: 1,
                    title: 'Annual Function 2025',
                    content: 'The annual function will be held on March 15, 2025. All students are requested to participate actively in the event.',
                    eventDate: new Date('2025-03-15'),
                    publishedOn: new Date('2025-02-01'),
                    author: 'Principal Office'
                },
                {
                    id: 2,
                    title: 'Exam Schedule Released',
                    content: 'The final examination schedule has been published. Please check your respective class sections for detailed information.',
                    eventDate: null,
                    publishedOn: new Date('2025-01-15'),
                    author: 'Examination Committee'
                }
            ],
            students: [
                {
                    rollNo: '2024001',
                    name: 'Aarav Patel',
                    class: '12',
                    section: 'A',
                    attendance: 90,
                    feeStatus: 'pending',
                    feePending: 20000
                },
                {
                    rollNo: '2024002',
                    name: 'Meera Singh',
                    class: '11',
                    section: 'B',
                    attendance: 97,
                    feeStatus: 'paid',
                    feePending: 0
                },
                {
                    rollNo: '2024003',
                    name: 'Rohan Kumar',
                    class: '10',
                    section: 'C',
                    attendance: 85,
                    feeStatus: 'pending',
                    feePending: 15000
                }
            ],
            faculty: [
                {
                    id: 'FAC001',
                    name: 'Dr. Amit Kumar',
                    department: 'Mathematics Department',
                    qualification: 'PhD in Mathematics',
                    experience: '15 years',
                    contact: '+91-9876543210'
                },
                {
                    id: 'FAC002',
                    name: 'Mrs. Sunita Singh',
                    department: 'Physics Department',
                    qualification: 'M.Sc. Physics',
                    experience: '12 years',
                    contact: '+91-9876543211'
                }
            ],
            parents: [
                {
                    id: 'PAR001',
                    parentName: 'Mr. Rajesh Patel',
                    contact: '+91-9876543230',
                    children: ['Aarav Patel (12A)'],
                    occupation: 'Business',
                    email: 'rajesh.patel@email.com'
                },
                {
                    id: 'PAR002',
                    parentName: 'Mrs. Kavita Singh',
                    contact: '+91-9876543231',
                    children: ['Meera Singh (11B)'],
                    occupation: 'Teacher',
                    email: 'kavita.singh@email.com'
                }
            ],
            feeTransactions: [
                {
                    id: 'TXN001',
                    student: 'Aarav Patel',
                    rollNo: '2024001',
                    amount: 20000,
                    status: 'pending',
                    dueDate: new Date('2025-03-15'),
                    class: '12A'
                },
                {
                    id: 'TXN002',
                    student: 'Meera Singh',
                    rollNo: '2024002',
                    amount: 48000,
                    status: 'paid',
                    dueDate: null,
                    class: '11B'
                }
            ],
            courses: [
                {
                    id: 'CRS001',
                    stream: 'Science Stream',
                    class: 'Class 12',
                    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
                    students: 85
                },
                {
                    id: 'CRS002',
                    stream: 'Commerce Stream',
                    class: 'Class 12',
                    subjects: ['Accountancy', 'Business Studies', 'Economics', 'Mathematics'],
                    students: 72
                }
            ]
        };
    }

    // Setup event listeners for interactive elements
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-view')) {
                this.handleViewAction(e.target.dataset.id, e.target.dataset.type);
            }
            if (e.target.classList.contains('btn-edit')) {
                this.handleEditAction(e.target.dataset.id, e.target.dataset.type);
            }
            if (e.target.classList.contains('btn-delete')) {
                this.handleDeleteAction(e.target.dataset.id, e.target.dataset.type);
            }
            if (e.target.classList.contains('btn-pay')) {
                this.handlePayAction(e.target.dataset.id);
            }
        });
    }

    // Main render function
    renderDashboard() {
        const dashboardContainer = document.getElementById('admin-dashboard');
        if (!dashboardContainer) return;

        dashboardContainer.innerHTML = `
            <div class="dashboard-container">
                ${this.renderStatsCards()}
                ${this.renderQuickActions()}
                ${this.renderAnalyticsDashboard()}
                ${this.renderManagementSections()}
            </div>
        `;

        // Render charts after DOM is updated
        setTimeout(() => {
            this.renderCharts();
        }, 100);
    }

    // Render statistics cards with proper formatting
    renderStatsCards() {
        const stats = this.dashboardData.stats;
        return `
            <div class="stats-container">
                <h2>Dashboard Overview</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalStudents.value.toLocaleString('en-IN')}</div>
                        <div class="stat-label">Total Students</div>
                        <div class="stat-change positive">+${stats.totalStudents.change} ${stats.totalStudents.period}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.facultyMembers.value}</div>
                        <div class="stat-label">Faculty Members</div>
                        <div class="stat-change positive">+${stats.facultyMembers.change} ${stats.facultyMembers.period}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">₹${this.formatCurrency(stats.feeCollection.value)}</div>
                        <div class="stat-label">Fee Collection</div>
                        <div class="stat-change positive">+${stats.feeCollection.change}% ${stats.feeCollection.period}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.avgAttendance.value}%</div>
                        <div class="stat-label">Avg Attendance</div>
                        <div class="stat-change positive">+${stats.avgAttendance.change}% ${stats.avgAttendance.period}</div>
                    </div>
                </div>
            </div>
        `;
    }

    // Render quick actions section
    renderQuickActions() {
        return `
            <div class="quick-actions-container">
                <div class="recent-activities">
                    <h3>Recent Activities</h3>
                    <div class="activities-list">
                        ${this.dashboardData.recentActivities.map(activity => `
                            <div class="activity-item">
                                <div class="activity-time">${this.formatTimeAgo(activity.timestamp)}</div>
                                <div class="activity-content">
                                    <strong>${activity.message}</strong>
                                    <div class="activity-user">By: ${activity.user}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="announcements">
                    <h3>Latest Announcements</h3>
                    <div class="announcements-list">
                        ${this.dashboardData.announcements.map(announcement => `
                            <div class="announcement-item">
                                <h4>${announcement.title}</h4>
                                <p>${announcement.content}</p>
                                <div class="announcement-meta">
                                    ${announcement.eventDate ? `<span class="event-date">Event Date: ${this.formatDate(announcement.eventDate)}</span>` : ''}
                                    <span class="published-date">Published On: ${this.formatDate(announcement.publishedOn)}</span>
                                    <span class="author">By: ${announcement.author}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Render analytics dashboard with charts
    renderAnalyticsDashboard() {
        return `
            <div class="analytics-container">
                <h2>Analytics Dashboard</h2>
                <div class="charts-grid">
                    <div class="chart-container">
                        <h3>Attendance Trends</h3>
                        <canvas id="attendanceChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3>Fee Collection</h3>
                        <canvas id="feeChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3>Student Performance</h3>
                        <canvas id="performanceChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3>Class Distribution</h3>
                        <canvas id="distributionChart"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    // Render all management sections
    renderManagementSections() {
        return `
            <div class="management-sections">
                ${this.renderStudentManagement()}
                ${this.renderFacultyManagement()}
                ${this.renderParentManagement()}
                ${this.renderFeeManagement()}
                ${this.renderCourseManagement()}
            </div>
        `;
    }

    // Render student management with corrected table structure
    renderStudentManagement() {
        return `
            <div class="management-section">
                <h2>Student Management</h2>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Roll No.</th>
                                <th>Name</th>
                                <th>Class</th>
                                <th>Section</th>
                                <th>Attendance</th>
                                <th>Fee Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.dashboardData.students.map(student => `
                                <tr>
                                    <td>${student.rollNo}</td>
                                    <td>${student.name}</td>
                                    <td>${student.class}</td>
                                    <td>${student.section}</td>
                                    <td>${student.attendance}%</td>
                                    <td>
                                        <span class="status ${student.feeStatus}">
                                            ${student.feeStatus === 'paid' ? 'Paid' : `₹${this.formatCurrency(student.feePending)} Pending`}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="action-buttons">
                                            <button class="btn-view" data-id="${student.rollNo}" data-type="student">View</button>
                                            <button class="btn-edit" data-id="${student.rollNo}" data-type="student">Edit</button>
                                            <button class="btn-delete" data-id="${student.rollNo}" data-type="student">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // Render faculty management
    renderFacultyManagement() {
        return `
            <div class="management-section">
                <h2>Faculty Management</h2>
                <div class="faculty-grid">
                    ${this.dashboardData.faculty.map(faculty => `
                        <div class="faculty-card">
                            <h4>${faculty.name}</h4>
                            <div class="faculty-details">
                                <p><strong>Department:</strong> ${faculty.department}</p>
                                <p><strong>Qualification:</strong> ${faculty.qualification}</p>
                                <p><strong>Experience:</strong> ${faculty.experience}</p>
                                <p><strong>Contact:</strong> ${faculty.contact}</p>
                            </div>
                            <div class="action-buttons">
                                <button class="btn-view" data-id="${faculty.id}" data-type="faculty">View</button>
                                <button class="btn-edit" data-id="${faculty.id}" data-type="faculty">Edit</button>
                                <button class="btn-delete" data-id="${faculty.id}" data-type="faculty">Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Render parent management with corrected table structure
    renderParentManagement() {
        return `
            <div class="management-section">
                <h2>Parent Management</h2>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Parent Name</th>
                                <th>Contact</th>
                                <th>Children</th>
                                <th>Occupation</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.dashboardData.parents.map(parent => `
                                <tr>
                                    <td>${parent.parentName}</td>
                                    <td>${parent.contact}</td>
                                    <td>${parent.children.join(', ')}</td>
                                    <td>${parent.occupation}</td>
                                    <td>
                                        <div class="action-buttons">
                                            <button class="btn-view" data-id="${parent.id}" data-type="parent">View</button>
                                            <button class="btn-edit" data-id="${parent.id}" data-type="parent">Edit</button>
                                            <button class="btn-delete" data-id="${parent.id}" data-type="parent">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // Render fee management with corrected structure
    renderFeeManagement() {
        const totalCollection = this.dashboardData.feeTransactions.reduce((sum, txn) => 
            txn.status === 'paid' ? sum + txn.amount : sum, 0);
        const pendingCollection = this.dashboardData.feeTransactions.reduce((sum, txn) => 
            txn.status === 'pending' ? sum + txn.amount : sum, 0);
        const collectionRate = (totalCollection / (totalCollection + pendingCollection)) * 100;

        return `
            <div class="management-section">
                <h2>Fee Management</h2>
                <div class="fee-stats">
                    <div class="fee-stat-card">
                        <div class="stat-value">₹${this.formatCurrency(totalCollection)}</div>
                        <div class="stat-label">Total Fee Collection</div>
                        <div class="stat-change positive">↑ 12% from last month</div>
                    </div>
                    <div class="fee-stat-card">
                        <div class="stat-value">₹${this.formatCurrency(pendingCollection)}</div>
                        <div class="stat-label">Pending Collection</div>
                        <div class="stat-info">${this.dashboardData.feeTransactions.filter(t => t.status === 'pending').length} students pending</div>
                    </div>
                    <div class="fee-stat-card">
                        <div class="stat-value">${collectionRate.toFixed(1)}%</div>
                        <div class="stat-label">Collection Rate</div>
                        <div class="stat-change positive">↑ 5.2% this quarter</div>
                    </div>
                </div>
                
                <h3>Recent Fee Transactions</h3>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Due Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.dashboardData.feeTransactions.map(transaction => `
                                <tr>
                                    <td>${transaction.student} (${transaction.class})</td>
                                    <td>₹${this.formatCurrency(transaction.amount)}</td>
                                    <td>
                                        <span class="status ${transaction.status}">
                                            ${transaction.status === 'paid' ? 'Paid' : 'Pending'}
                                        </span>
                                    </td>
                                    <td>${transaction.dueDate ? this.formatDate(transaction.dueDate) : '-'}</td>
                                    <td>
                                        <div class="action-buttons">
                                            <button class="btn-view" data-id="${transaction.id}" data-type="transaction">View</button>
                                            ${transaction.status === 'pending' ? 
                                                `<button class="btn-pay" data-id="${transaction.id}">Collect Fee</button>` : 
                                                `<button class="btn-edit" data-id="${transaction.id}" data-type="transaction">Edit</button>`
                                            }
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // Render course management with proper formatting
    renderCourseManagement() {
        return `
            <div class="management-section">
                <h2>Course Management</h2>
                <div class="courses-grid">
                    ${this.dashboardData.courses.map(course => `
                        <div class="course-card">
                            <h4>${course.stream} — ${course.class}</h4>
                            <div class="course-details">
                                <p><strong>Students Enrolled:</strong> ${course.students}</p>
                                <p><strong>Subjects:</strong></p>
                                <ul>
                                    ${course.subjects.map(subject => `<li>${subject}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="action-buttons">
                                <button class="btn-view" data-id="${course.id}" data-type="course">View Details</button>
                                <button class="btn-edit" data-id="${course.id}" data-type="course">Edit Course</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Render charts using Chart.js or similar library
    renderCharts() {
        this.renderAttendanceChart();
        this.renderFeeChart();
        this.renderPerformanceChart();
        this.renderDistributionChart();
    }

    renderAttendanceChart() {
        const canvas = document.getElementById('attendanceChart');
        if (!canvas) return;

        // Sample data for attendance trends
        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Attendance %',
                data: [88, 90, 92, 89, 94, 92.5],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.1)',
                tension: 0.1
            }]
        };

        // Use Chart.js if available, otherwise show placeholder
        if (typeof Chart !== 'undefined') {
            new Chart(canvas, {
                type: 'line',
                data: data,
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Monthly Attendance Trends'
                        }
                    }
                }
            });
        } else {
            canvas.parentElement.innerHTML = '<div class="chart-placeholder">Chart.js library required for visualization</div>';
        }
    }

    renderFeeChart() {
        const canvas = document.getElementById('feeChart');
        if (!canvas) return;

        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Fee Collection (₹)',
                data: [2200000, 2400000, 2600000, 2300000, 2700000, 2850000],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };

        if (typeof Chart !== 'undefined') {
            new Chart(canvas, {
                type: 'bar',
                data: data,
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Monthly Fee Collection'
                        }
                    }
                }
            });
        } else {
            canvas.parentElement.innerHTML = '<div class="chart-placeholder">Chart.js library required for visualization</div>';
        }
    }

    renderPerformanceChart() {
        const canvas = document.getElementById('performanceChart');
        if (!canvas) return;

        const data = {
            labels: ['Class 10', 'Class 11', 'Class 12'],
            datasets: [{
                label: 'Average Score (%)',
                data: [82, 78.8, 85.2],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 205, 86, 0.5)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 205, 86, 1)'
                ],
                borderWidth: 1
            }]
        };

        if (typeof Chart !== 'undefined') {
            new Chart(canvas, {
                type: 'doughnut',
                data: data,
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Class-wise Performance'
                        }
                    }
                }
            });
        } else {
            canvas.parentElement.innerHTML = '<div class="chart-placeholder">Chart.js library required for visualization</div>';
        }
    }

    renderDistributionChart() {
        const canvas = document.getElementById('distributionChart');
        if (!canvas) return;

        const data = {
            labels: ['Science Stream', 'Commerce Stream', 'Arts Stream'],
            datasets: [{
                label: 'Students',
                data: [85, 72, 45],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)',
                    'rgba(255, 159, 64, 0.5)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        };

        if (typeof Chart !== 'undefined') {
            new Chart(canvas, {
                type: 'pie',
                data: data,
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Student Distribution by Stream'
                        }
                    }
                }
            });
        } else {
            canvas.parentElement.innerHTML = '<div class="chart-placeholder">Chart.js library required for visualization</div>';
        }
    }

    // Action handlers
    handleViewAction(id, type) {
        console.log(`View ${type} with ID: ${id}`);
        // Implement view logic based on type
        alert(`View ${type} functionality - ID: ${id}`);
    }

    handleEditAction(id, type) {
        console.log(`Edit ${type} with ID: ${id}`);
        // Implement edit logic based on type
        alert(`Edit ${type} functionality - ID: ${id}`);
    }

    handleDeleteAction(id, type) {
        if (confirm(`Are you sure you want to delete this ${type}?`)) {
            console.log(`Delete ${type} with ID: ${id}`);
            // Implement delete logic based on type
            alert(`Delete ${type} functionality - ID: ${id}`);
        }
    }

    handlePayAction(transactionId) {
        if (confirm('Mark this fee as collected?')) {
            // Find and update transaction
            const transaction = this.dashboardData.feeTransactions.find(t => t.id === transactionId);
            if (transaction) {
                transaction.status = 'paid';
                transaction.dueDate = null;
                this.renderDashboard(); // Re-render to reflect changes
                alert('Fee collection recorded successfully!');
            }
        }
    }

    // Utility functions
    formatCurrency(amount) {
        if (amount >= 10000000) { // 1 crore
            return `${(amount / 10000000).toFixed(1)}Cr`;
        } else if (amount >= 100000) { // 1 lakh
            return `${(amount / 100000).toFixed(1)}L`;
        } else {
            return amount.toLocaleString('en-IN');
        }
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    }

    formatTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    }

    // Handle section navigation
    handleSectionNavigation(section) {
        console.log('Navigating to section:', section);
        
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.style.display = 'none';
            sec.classList.remove('active');
        });
        
        // Show selected section
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.classList.add('active');
        }
        
        // Initialize section-specific modules
        setTimeout(() => {
            this.initializeSection(section);
        }, 100);
    }

    // Initialize section-specific modules
    initializeSection(section) {
        switch (section) {
            case 'students':
                this.initializeStudentManagement();
                break;
            case 'faculty':
                this.initializeFacultyManagement();
                break;
            case 'attendance':
                this.initializeAttendanceManagement();
                break;
            case 'fees':
                this.initializeFeeManagement();
                break;
            case 'admin-controls':
                this.initializeAdminControls();
                break;
            case 'overview':
                this.renderOverviewSection();
                break;
            case 'analytics':
                this.renderAnalyticsSection();
                break;
        }
    }

    // Initialize student management
    initializeStudentManagement() {
        const section = document.getElementById('students-section');
        if (section && !section.innerHTML.includes('student-management-container')) {
            if (window.studentManager) {
                section.innerHTML = window.studentManager.renderStudentInterface();
                window.studentManager.addStyles();
                window.studentManager.renderStudentTable();
                window.studentManager.renderCharts();
            } else {
                section.innerHTML = '<div class="placeholder">Student management module not loaded</div>';
            }
        }
    }

    // Initialize faculty management
    initializeFacultyManagement() {
        const section = document.getElementById('faculty-section');
        if (section && !section.innerHTML.includes('faculty-management-container')) {
            if (window.facultyManager) {
                section.innerHTML = window.facultyManager.renderFacultyInterface();
                window.facultyManager.addStyles();
                window.facultyManager.renderFacultyTable();
                window.facultyManager.renderCharts();
            } else {
                section.innerHTML = '<div class="placeholder">Faculty management module not loaded</div>';
            }
        }
    }

    // Initialize attendance management
    initializeAttendanceManagement() {
        const section = document.getElementById('attendance-section');
        if (section && !section.innerHTML.includes('attendance-management-container')) {
            if (window.attendanceManager) {
                section.innerHTML = window.attendanceManager.renderAttendanceInterface();
                window.attendanceManager.addStyles();
                window.attendanceManager.renderAttendanceTable();
                window.attendanceManager.renderCharts();
            } else {
                section.innerHTML = '<div class="placeholder">Attendance management module not loaded</div>';
            }
        }
    }

    // Initialize fee management
    initializeFeeManagement() {
        const section = document.getElementById('fees-section');
        if (section && !section.innerHTML.includes('fee-management-container')) {
            if (window.feeManager) {
                section.innerHTML = window.feeManager.renderFeeInterface();
                window.feeManager.renderFeeTable();
            } else {
                section.innerHTML = '<div class="placeholder">Fee management module not loaded</div>';
            }
        }
    }

    // Initialize admin controls
    initializeAdminControls() {
        const section = document.getElementById('admin-controls-section');
        if (section && !section.innerHTML.includes('admin-controls-container')) {
            if (window.adminControlsManager) {
                console.log('Admin controls manager found, initializing...');
                window.adminControlsManager.init();
            } else {
                console.warn('Admin controls manager not found, using fallback');
                this.initializeAdminControlsFallback();
            }
        }
    }

    // Render overview section
    renderOverviewSection() {
        const section = document.getElementById('overview-section');
        if (section) {
            section.style.display = 'block';
            section.classList.add('active');
            this.renderDashboard();
        }
    }

    // Render analytics section
    renderAnalyticsSection() {
        const section = document.getElementById('analytics-section');
        if (section) {
            section.style.display = 'block';
            section.classList.add('active');
            setTimeout(() => {
                this.renderCharts();
            }, 100);
        }
    }

    // Fallback admin controls initialization
    initializeAdminControlsFallback() {
        const adminSection = document.getElementById('admin-controls-section');
        if (adminSection && !adminSection.innerHTML.includes('admin-controls-container')) {
            console.log('Setting up fallback admin controls...');
            adminSection.innerHTML = `
                <div class="admin-controls-container">
                    <div class="admin-header">
                        <h2><i class="fas fa-cogs"></i> Admin Controls</h2>
                        <p>Manage school settings, payment methods, and system configuration</p>
                    </div>
                    
                    <div class="admin-tabs">
                        <button class="tab-btn active" onclick="adminDashboard.showAdminTab('bank-accounts')">
                            <i class="fas fa-university"></i> Bank Accounts
                        </button>
                        <button class="tab-btn" onclick="adminDashboard.showAdminTab('qr-codes')">
                            <i class="fas fa-qrcode"></i> QR Codes
                        </button>
                    </div>

                    <div id="bank-accounts-tab" class="tab-content active">
                        <div class="section-header">
                            <h3><i class="fas fa-university"></i> Bank Account Management</h3>
                            <button class="btn-add" onclick="adminDashboard.openBankAccountModal()">
                                <i class="fas fa-plus"></i> Add Bank Account
                            </button>
                        </div>
                        <div class="bank-accounts-list" id="bank-accounts-list">
                            <div class="loading">Loading bank accounts...</div>
                        </div>
                    </div>

                    <div id="qr-codes-tab" class="tab-content">
                        <div class="section-header">
                            <h3><i class="fas fa-qrcode"></i> QR Code Management</h3>
                            <button class="btn-add" onclick="adminDashboard.openQRUploadModal()">
                                <i class="fas fa-upload"></i> Upload QR Code
                            </button>
                        </div>
                        <div class="qr-codes-list" id="qr-codes-list">
                            <div class="loading">Loading QR codes...</div>
                        </div>
                    </div>
                </div>
            `;
            
            this.addAdminControlsStyles();
            this.loadAdminData();
        }
    }

    // Add admin controls styles
    addAdminControlsStyles() {
        if (document.getElementById('admin-controls-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'admin-controls-styles';
        style.textContent = `
            .admin-controls-container {
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                margin-bottom: 20px;
            }

            .admin-header {
                text-align: center;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 2px solid #f0f0f0;
            }

            .admin-header h2 {
                color: #1e293b;
                margin-bottom: 8px;
            }

            .admin-tabs {
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

            .btn-add {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 6px;
                background: #10b981;
                color: white;
            }

            .btn-add:hover {
                background: #059669;
            }

            .bank-account-card, .qr-code-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 15px;
            }

            .account-header, .qr-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }

            .account-name, .qr-name {
                font-weight: 600;
                color: #1e293b;
                font-size: 16px;
            }

            .account-status, .qr-status {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
            }

            .account-status.active, .qr-status.active {
                background: #d1fae5;
                color: #065f46;
            }

            .account-status.inactive, .qr-status.inactive {
                background: #fee2e2;
                color: #991b1b;
            }

            .account-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }

            .detail-item {
                display: flex;
                flex-direction: column;
            }

            .detail-label {
                font-size: 12px;
                color: #64748b;
                margin-bottom: 2px;
            }

            .detail-value {
                font-weight: 500;
                color: #1e293b;
            }

            .loading {
                text-align: center;
                padding: 20px;
                color: #6b7280;
            }
        `;
        document.head.appendChild(style);
    }

    // Show admin tab
    showAdminTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

        const tabElement = document.getElementById(`${tabName}-tab`);
        const btnElement = event.target;
        
        if (tabElement) tabElement.classList.add('active');
        if (btnElement) btnElement.classList.add('active');
    }

    // Load admin data
    loadAdminData() {
        this.loadBankAccounts();
        this.loadQRCodes();
    }

    // Load bank accounts
    loadBankAccounts() {
        const accountsList = document.getElementById('bank-accounts-list');
        if (!accountsList) return;

        const accounts = JSON.parse(localStorage.getItem('bank_accounts') || '[]');
        accountsList.innerHTML = accounts.length === 0 ? 
            '<div class="loading">No bank accounts found</div>' :
            accounts.map(account => `
                <div class="bank-account-card">
                    <div class="account-header">
                        <div class="account-name">${account.bankName}</div>
                        <div class="account-status ${account.status}">${account.status.toUpperCase()}</div>
                    </div>
                    <div class="account-details">
                        <div class="detail-item">
                            <div class="detail-label">Account Holder</div>
                            <div class="detail-value">${account.accountHolder}</div>
                        </div>
                    </div>
                </div>
            `).join('');
    }

    // Load QR codes
    loadQRCodes() {
        const qrList = document.getElementById('qr-codes-list');
        if (!qrList) return;

        const qrCodes = JSON.parse(localStorage.getItem('qr_codes') || '[]');
        qrList.innerHTML = qrCodes.length === 0 ? 
            '<div class="loading">No QR codes found</div>' :
            qrCodes.map(qr => `
                <div class="qr-code-card">
                    <div class="qr-header">
                        <div class="qr-name">${qr.name}</div>
                        <div class="qr-status ${qr.status}">${qr.status.toUpperCase()}</div>
                    </div>
                </div>
            `).join('');
    }

    // Open bank account modal
    openBankAccountModal() {
        alert('Bank account management - Add new bank account functionality');
    }

    // Open QR upload modal
    openQRUploadModal() {
        alert('QR code management - Upload new QR code functionality');
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new AdminDashboard();
    window.adminDashboard = dashboard; // Make it globally accessible
    
    // Setup section navigation
    const menuLinks = document.querySelectorAll('.menu-item');
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            dashboard.handleSectionNavigation(section);
        });
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDashboard;
}
