// Student Management Module for Admin Dashboard
// Handles student CRUD operations, enrollment, and management

class StudentManager {
    constructor() {
        this.students = [];
        this.currentFilter = {
            class: 'all',
            section: 'all',
            status: 'all',
            search: ''
        };
        this.init();
    }

    init() {
        this.loadStudents();
        this.setupEventListeners();
    }

    // Load students data
    async loadStudents() {
        try {
            if (typeof DatabaseHelper !== 'undefined') {
                this.students = await DatabaseHelper.getAllStudents();
            } else {
                // Fallback to localStorage
                const registeredStudents = JSON.parse(localStorage.getItem('registeredStudents') || '[]');
                const sampleStudents = JSON.parse(localStorage.getItem('sampleStudents') || '[]');
                this.students = [...registeredStudents, ...sampleStudents];
            }
        } catch (error) {
            console.error('Error loading students:', error);
            this.students = [];
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for real-time updates
        if (typeof RealtimeListeners !== 'undefined') {
            // Listen to student collection changes
            db.collection('students').onSnapshot((snapshot) => {
                const changes = snapshot.docChanges();
                changes.forEach(change => {
                    if (change.type === 'added' || change.type === 'modified') {
                        const data = { id: change.doc.id, ...change.doc.data() };
                        this.updateStudentData(data);
                    } else if (change.type === 'removed') {
                        this.removeStudentData(change.doc.id);
                    }
                });
            });
        }
    }

    // Update student data
    updateStudentData(newData) {
        const existingIndex = this.students.findIndex(student => student.id === newData.id);
        if (existingIndex >= 0) {
            this.students[existingIndex] = newData;
        } else {
            this.students.unshift(newData);
        }
        this.renderStudentTable();
    }

    // Remove student data
    removeStudentData(studentId) {
        this.students = this.students.filter(student => student.id !== studentId);
        this.renderStudentTable();
    }

    // Render student management interface
    renderStudentInterface() {
        return `
            <div class="student-management-container">
                <div class="student-header">
                    <h2><i class="fas fa-user-graduate"></i> Student Management</h2>
                    <div class="student-actions">
                        <button class="btn-primary" onclick="studentManager.openAddStudentModal()">
                            <i class="fas fa-user-plus"></i> Add New Student
                        </button>
                        <button class="btn-secondary" onclick="studentManager.exportStudentData()">
                            <i class="fas fa-download"></i> Export Data
                        </button>
                    </div>
                </div>

                <div class="student-filters">
                    <div class="filter-group">
                        <label>Class:</label>
                        <select id="studentClassFilter" onchange="studentManager.filterStudents()">
                            <option value="all">All Classes</option>
                            <option value="9">Class 9</option>
                            <option value="10">Class 10</option>
                            <option value="11">Class 11</option>
                            <option value="12">Class 12</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Section:</label>
                        <select id="studentSectionFilter" onchange="studentManager.filterStudents()">
                            <option value="all">All Sections</option>
                            <option value="A">Section A</option>
                            <option value="B">Section B</option>
                            <option value="C">Section C</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Status:</label>
                        <select id="studentStatusFilter" onchange="studentManager.filterStudents()">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Search:</label>
                        <input type="text" id="studentSearch" placeholder="Search by name or roll number..." 
                               onkeyup="studentManager.filterStudents()">
                    </div>
                </div>

                <div class="student-stats">
                    <div class="stat-card">
                        <div class="stat-value" id="totalStudentsCount">0</div>
                        <div class="stat-label">Total Students</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="activeStudentsCount">0</div>
                        <div class="stat-label">Active Students</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="pendingStudentsCount">0</div>
                        <div class="stat-label">Pending Approval</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="newAdmissionsCount">0</div>
                        <div class="stat-label">New This Month</div>
                    </div>
                </div>

                <div class="student-table-container">
                    <table class="student-table" id="studentTable">
                        <thead>
                            <tr>
                                <th>Photo</th>
                                <th>Name</th>
                                <th>Roll No.</th>
                                <th>Class</th>
                                <th>Section</th>
                                <th>Contact</th>
                                <th>Status</th>
                                <th>Admission Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="studentTableBody">
                            <tr>
                                <td colspan="9" class="loading">Loading student data...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="student-charts">
                    <div class="chart-container">
                        <h3>Class Distribution</h3>
                        <canvas id="classDistributionChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3>Monthly Admissions</h3>
                        <canvas id="monthlyAdmissionsChart"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    // Render student table
    renderStudentTable() {
        const tbody = document.getElementById('studentTableBody');
        if (!tbody) return;

        const filteredStudents = this.getFilteredStudents();

        if (filteredStudents.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="no-data">No students found</td></tr>';
            return;
        }

        tbody.innerHTML = filteredStudents.map(student => `
            <tr>
                <td>
                    <div class="student-photo">
                        <img src="${student.photo || 'https://via.placeholder.com/40x40'}" 
                             alt="${student.name || student.fullName}" 
                             onerror="this.src='https://via.placeholder.com/40x40'">
                    </div>
                </td>
                <td>
                    <div class="student-name">
                        <strong>${student.name || student.fullName}</strong>
                        <div class="student-email">${student.email}</div>
                    </div>
                </td>
                <td>${student.rollNumber || student.studentRollNumber || 'N/A'}</td>
                <td>${student.class || 'N/A'}</td>
                <td>${student.section || 'N/A'}</td>
                <td>
                    <div class="contact-info">
                        <div>${student.phoneNumber || student.phone || 'N/A'}</div>
                        <div class="address">${student.address || 'N/A'}</div>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${student.status || 'active'}">
                        ${(student.status || 'active').toUpperCase()}
                    </span>
                </td>
                <td>${this.formatDate(student.admissionDate || student.createdAt)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-view" onclick="studentManager.viewStudent('${student.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-edit" onclick="studentManager.editStudent('${student.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="studentManager.deleteStudent('${student.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updateStudentStats();
    }

    // Get filtered students
    getFilteredStudents() {
        let filtered = [...this.students];

        // Filter by class
        if (this.currentFilter.class !== 'all') {
            filtered = filtered.filter(student => student.class === this.currentFilter.class);
        }

        // Filter by section
        if (this.currentFilter.section !== 'all') {
            filtered = filtered.filter(student => student.section === this.currentFilter.section);
        }

        // Filter by status
        if (this.currentFilter.status !== 'all') {
            filtered = filtered.filter(student => (student.status || 'active') === this.currentFilter.status);
        }

        // Filter by search
        if (this.currentFilter.search) {
            const searchTerm = this.currentFilter.search.toLowerCase();
            filtered = filtered.filter(student => 
                (student.name || student.fullName || '').toLowerCase().includes(searchTerm) ||
                (student.rollNumber || student.studentRollNumber || '').toLowerCase().includes(searchTerm) ||
                (student.email || '').toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }

    // Update student statistics
    updateStudentStats() {
        const totalStudents = this.students.length;
        const activeStudents = this.students.filter(student => (student.status || 'active') === 'active').length;
        const pendingStudents = this.students.filter(student => (student.status || 'active') === 'pending').length;
        
        // Count new admissions this month
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const newAdmissions = this.students.filter(student => {
            const admissionDate = new Date(student.admissionDate || student.createdAt);
            return admissionDate.getMonth() === thisMonth && admissionDate.getFullYear() === thisYear;
        }).length;

        const totalStudentsEl = document.getElementById('totalStudentsCount');
        const activeStudentsEl = document.getElementById('activeStudentsCount');
        const pendingStudentsEl = document.getElementById('pendingStudentsCount');
        const newAdmissionsEl = document.getElementById('newAdmissionsCount');

        if (totalStudentsEl) totalStudentsEl.textContent = totalStudents;
        if (activeStudentsEl) activeStudentsEl.textContent = activeStudents;
        if (pendingStudentsEl) pendingStudentsEl.textContent = pendingStudents;
        if (newAdmissionsEl) newAdmissionsEl.textContent = newAdmissions;
    }

    // Filter students
    filterStudents() {
        this.currentFilter.class = document.getElementById('studentClassFilter')?.value || 'all';
        this.currentFilter.section = document.getElementById('studentSectionFilter')?.value || 'all';
        this.currentFilter.status = document.getElementById('studentStatusFilter')?.value || 'all';
        this.currentFilter.search = document.getElementById('studentSearch')?.value || '';

        this.renderStudentTable();
        this.renderCharts();
    }

    // Open add student modal
    openAddStudentModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content add-student-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-user-plus"></i> Add New Student</h3>
                    <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="addStudentForm" onsubmit="studentManager.submitNewStudent(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <label>First Name *</label>
                                <input type="text" id="newStudentFirstName" required>
                            </div>
                            <div class="form-group">
                                <label>Last Name *</label>
                                <input type="text" id="newStudentLastName" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Email *</label>
                                <input type="email" id="newStudentEmail" required>
                            </div>
                            <div class="form-group">
                                <label>Phone Number *</label>
                                <input type="tel" id="newStudentPhone" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Date of Birth *</label>
                                <input type="date" id="newStudentDOB" required>
                            </div>
                            <div class="form-group">
                                <label>Gender *</label>
                                <select id="newStudentGender" required>
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Class *</label>
                                <select id="newStudentClass" required>
                                    <option value="">Select Class</option>
                                    <option value="9">Class 9</option>
                                    <option value="10">Class 10</option>
                                    <option value="11">Class 11</option>
                                    <option value="12">Class 12</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Section *</label>
                                <select id="newStudentSection" required>
                                    <option value="">Select Section</option>
                                    <option value="A">Section A</option>
                                    <option value="B">Section B</option>
                                    <option value="C">Section C</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Roll Number *</label>
                                <input type="text" id="newStudentRollNumber" required>
                            </div>
                            <div class="form-group">
                                <label>Admission Date *</label>
                                <input type="date" id="newStudentAdmissionDate" value="${new Date().toISOString().split('T')[0]}" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Address *</label>
                            <textarea id="newStudentAddress" rows="3" required></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Parent Name *</label>
                                <input type="text" id="newStudentParentName" required>
                            </div>
                            <div class="form-group">
                                <label>Parent Contact *</label>
                                <input type="tel" id="newStudentParentContact" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Photo</label>
                            <input type="file" id="newStudentPhoto" accept="image/*">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Cancel</button>
                    <button class="btn-primary" onclick="studentManager.submitNewStudent()">Add Student</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Submit new student
    async submitNewStudent(event) {
        if (event) event.preventDefault();

        const form = document.getElementById('addStudentForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const studentData = {
            firstName: document.getElementById('newStudentFirstName').value.trim(),
            lastName: document.getElementById('newStudentLastName').value.trim(),
            email: document.getElementById('newStudentEmail').value.trim(),
            phoneNumber: document.getElementById('newStudentPhone').value.trim(),
            dateOfBirth: document.getElementById('newStudentDOB').value,
            gender: document.getElementById('newStudentGender').value,
            class: document.getElementById('newStudentClass').value,
            section: document.getElementById('newStudentSection').value,
            rollNumber: document.getElementById('newStudentRollNumber').value.trim(),
            admissionDate: document.getElementById('newStudentAdmissionDate').value,
            address: document.getElementById('newStudentAddress').value.trim(),
            parentName: document.getElementById('newStudentParentName').value.trim(),
            parentContact: document.getElementById('newStudentParentContact').value.trim(),
            status: 'active',
            role: 'student',
            createdAt: new Date().toISOString()
        };

        try {
            let studentId;
            
            if (typeof DatabaseHelper !== 'undefined') {
                // Use Firebase
                studentId = await DatabaseHelper.addStudent(studentData);
            } else {
                // Fallback to localStorage
                studentId = 'STU' + Date.now().toString().slice(-6);
                studentData.id = studentId;
                
                let students = JSON.parse(localStorage.getItem('registeredStudents') || '[]');
                students.push(studentData);
                localStorage.setItem('registeredStudents', JSON.stringify(students));
            }

            // Update local data
            this.students.unshift({ id: studentId, ...studentData });
            this.renderStudentTable();

            alert('Student added successfully!');
            
            // Close modal
            document.querySelector('.add-student-modal').parentElement.remove();

        } catch (error) {
            console.error('Error adding student:', error);
            alert('Error adding student. Please try again.');
        }
    }

    // View student details
    viewStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content view-student-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-user"></i> Student Details</h3>
                    <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="student-details">
                        <div class="student-photo-large">
                            <img src="${student.photo || 'https://via.placeholder.com/120x120'}" 
                                 alt="${student.name || student.fullName}"
                                 onerror="this.src='https://via.placeholder.com/120x120'">
                        </div>
                        <div class="student-info">
                            <h4>${student.name || student.fullName}</h4>
                            <div class="info-grid">
                                <div class="info-item">
                                    <label>Roll Number:</label>
                                    <span>${student.rollNumber || student.studentRollNumber || 'N/A'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Class & Section:</label>
                                    <span>Class ${student.class || 'N/A'} - Section ${student.section || 'N/A'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Email:</label>
                                    <span>${student.email}</span>
                                </div>
                                <div class="info-item">
                                    <label>Phone:</label>
                                    <span>${student.phoneNumber || student.phone || 'N/A'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Date of Birth:</label>
                                    <span>${this.formatDate(student.dateOfBirth)}</span>
                                </div>
                                <div class="info-item">
                                    <label>Gender:</label>
                                    <span>${student.gender || 'N/A'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Admission Date:</label>
                                    <span>${this.formatDate(student.admissionDate || student.createdAt)}</span>
                                </div>
                                <div class="info-item">
                                    <label>Status:</label>
                                    <span class="status-badge ${student.status || 'active'}">${(student.status || 'active').toUpperCase()}</span>
                                </div>
                                <div class="info-item full-width">
                                    <label>Address:</label>
                                    <span>${student.address || 'N/A'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Parent Name:</label>
                                    <span>${student.parentName || 'N/A'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Parent Contact:</label>
                                    <span>${student.parentContact || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Close</button>
                    <button class="btn-primary" onclick="studentManager.editStudent('${studentId}')">Edit Student</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Edit student
    editStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content edit-student-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Edit Student</h3>
                    <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="editStudentForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label>First Name *</label>
                                <input type="text" id="editStudentFirstName" value="${student.firstName || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Last Name *</label>
                                <input type="text" id="editStudentLastName" value="${student.lastName || ''}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Email *</label>
                                <input type="email" id="editStudentEmail" value="${student.email || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Phone Number *</label>
                                <input type="tel" id="editStudentPhone" value="${student.phoneNumber || student.phone || ''}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Class *</label>
                                <select id="editStudentClass" required>
                                    <option value="">Select Class</option>
                                    <option value="9" ${student.class === '9' ? 'selected' : ''}>Class 9</option>
                                    <option value="10" ${student.class === '10' ? 'selected' : ''}>Class 10</option>
                                    <option value="11" ${student.class === '11' ? 'selected' : ''}>Class 11</option>
                                    <option value="12" ${student.class === '12' ? 'selected' : ''}>Class 12</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Section *</label>
                                <select id="editStudentSection" required>
                                    <option value="">Select Section</option>
                                    <option value="A" ${student.section === 'A' ? 'selected' : ''}>Section A</option>
                                    <option value="B" ${student.section === 'B' ? 'selected' : ''}>Section B</option>
                                    <option value="C" ${student.section === 'C' ? 'selected' : ''}>Section C</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Roll Number *</label>
                                <input type="text" id="editStudentRollNumber" value="${student.rollNumber || student.studentRollNumber || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Status *</label>
                                <select id="editStudentStatus" required>
                                    <option value="active" ${(student.status || 'active') === 'active' ? 'selected' : ''}>Active</option>
                                    <option value="inactive" ${student.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                    <option value="pending" ${student.status === 'pending' ? 'selected' : ''}>Pending</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Address *</label>
                            <textarea id="editStudentAddress" rows="3" required>${student.address || ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Cancel</button>
                    <button class="btn-primary" onclick="studentManager.updateStudent('${studentId}')">Update Student</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Update student
    async updateStudent(studentId) {
        const form = document.getElementById('editStudentForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const updateData = {
            firstName: document.getElementById('editStudentFirstName').value.trim(),
            lastName: document.getElementById('editStudentLastName').value.trim(),
            email: document.getElementById('editStudentEmail').value.trim(),
            phoneNumber: document.getElementById('editStudentPhone').value.trim(),
            class: document.getElementById('editStudentClass').value,
            section: document.getElementById('editStudentSection').value,
            rollNumber: document.getElementById('editStudentRollNumber').value.trim(),
            status: document.getElementById('editStudentStatus').value,
            address: document.getElementById('editStudentAddress').value.trim(),
            updatedAt: new Date().toISOString()
        };

        try {
            if (typeof DatabaseHelper !== 'undefined') {
                // Use Firebase
                await db.collection('students').doc(studentId).update(updateData);
            } else {
                // Update in localStorage
                let students = JSON.parse(localStorage.getItem('registeredStudents') || '[]');
                const index = students.findIndex(s => s.id === studentId);
                if (index >= 0) {
                    students[index] = { ...students[index], ...updateData };
                    localStorage.setItem('registeredStudents', JSON.stringify(students));
                }
            }

            // Update local data
            const index = this.students.findIndex(s => s.id === studentId);
            if (index >= 0) {
                this.students[index] = { ...this.students[index], ...updateData };
            }

            this.renderStudentTable();
            alert('Student updated successfully!');

            // Close modal
            document.querySelector('.edit-student-modal').parentElement.remove();

        } catch (error) {
            console.error('Error updating student:', error);
            alert('Error updating student. Please try again.');
        }
    }

    // Delete student
    async deleteStudent(studentId) {
        if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
            return;
        }

        try {
            if (typeof DatabaseHelper !== 'undefined') {
                // Use Firebase
                await db.collection('students').doc(studentId).delete();
            } else {
                // Remove from localStorage
                let students = JSON.parse(localStorage.getItem('registeredStudents') || '[]');
                students = students.filter(s => s.id !== studentId);
                localStorage.setItem('registeredStudents', JSON.stringify(students));
            }

            // Remove from local data
            this.students = this.students.filter(s => s.id !== studentId);
            this.renderStudentTable();

            alert('Student deleted successfully!');

        } catch (error) {
            console.error('Error deleting student:', error);
            alert('Error deleting student. Please try again.');
        }
    }

    // Export student data
    exportStudentData() {
        const filteredStudents = this.getFilteredStudents();
        
        if (filteredStudents.length === 0) {
            alert('No data to export');
            return;
        }

        const csvData = filteredStudents.map(student => ({
            'Name': student.name || student.fullName,
            'Roll Number': student.rollNumber || student.studentRollNumber,
            'Class': student.class,
            'Section': student.section,
            'Email': student.email,
            'Phone': student.phoneNumber || student.phone,
            'Status': student.status || 'active',
            'Admission Date': student.admissionDate || student.createdAt,
            'Address': student.address
        }));

        DashboardUtils.exportToCSV(csvData, `students_${new Date().toISOString().split('T')[0]}.csv`);
    }

    // Render charts
    renderCharts() {
        this.renderClassDistributionChart();
        this.renderMonthlyAdmissionsChart();
    }

    // Render class distribution chart
    renderClassDistributionChart() {
        const canvas = document.getElementById('classDistributionChart');
        if (!canvas || typeof Chart === 'undefined') return;

        const classData = {};
        this.students.forEach(student => {
            const className = student.class || 'Unknown';
            classData[className] = (classData[className] || 0) + 1;
        });

        const classes = Object.keys(classData);
        const counts = Object.values(classData);

        new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: classes.map(cls => `Class ${cls}`),
                datasets: [{
                    data: counts,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 205, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(153, 102, 255, 0.5)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 205, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Student Distribution by Class'
                    }
                }
            }
        });
    }

    // Render monthly admissions chart
    renderMonthlyAdmissionsChart() {
        const canvas = document.getElementById('monthlyAdmissionsChart');
        if (!canvas || typeof Chart === 'undefined') return;

        const monthlyData = {};
        this.students.forEach(student => {
            const date = new Date(student.admissionDate || student.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
        });

        const months = Object.keys(monthlyData).sort();
        const counts = months.map(month => monthlyData[month]);

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: months.map(month => {
                    const [year, monthNum] = month.split('-');
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
                }),
                datasets: [{
                    label: 'New Admissions',
                    data: counts,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Admissions Trend'
                    }
                }
            }
        });
    }

    // Format date
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Add CSS styles
    addStyles() {
        if (document.getElementById('student-management-styles')) return;

        const style = document.createElement('style');
        style.id = 'student-management-styles';
        style.textContent = `
            .student-management-container {
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                margin-bottom: 20px;
            }

            .student-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 2px solid #f0f0f0;
            }

            .student-header h2 {
                color: #1e293b;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .student-actions {
                display: flex;
                gap: 10px;
            }

            .student-filters {
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

            .filter-group select,
            .filter-group input {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                background: white;
                font-size: 14px;
            }

            .student-stats {
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

            .student-table-container {
                overflow-x: auto;
                margin-bottom: 25px;
            }

            .student-table {
                width: 100%;
                border-collapse: collapse;
                background: white;
            }

            .student-table th,
            .student-table td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #e2e8f0;
            }

            .student-table th {
                background: #f8fafc;
                font-weight: 600;
                color: #374151;
            }

            .student-photo img {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                object-fit: cover;
            }

            .student-name strong {
                color: #1e293b;
            }

            .student-email {
                font-size: 12px;
                color: #64748b;
            }

            .contact-info {
                font-size: 14px;
            }

            .address {
                font-size: 12px;
                color: #64748b;
            }

            .status-badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
            }

            .status-badge.active {
                background: #d1fae5;
                color: #065f46;
            }

            .status-badge.inactive {
                background: #fee2e2;
                color: #991b1b;
            }

            .status-badge.pending {
                background: #fef3c7;
                color: #92400e;
            }

            .action-buttons {
                display: flex;
                gap: 5px;
            }

            .btn-view, .btn-edit, .btn-delete {
                padding: 6px 10px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            }

            .btn-view {
                background: #6b7280;
                color: white;
            }

            .btn-edit {
                background: #3b82f6;
                color: white;
            }

            .btn-delete {
                background: #ef4444;
                color: white;
            }

            .student-charts {
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

            .add-student-modal, .edit-student-modal {
                max-width: 800px;
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }

            .form-group label {
                font-weight: 500;
                color: #374151;
            }

            .form-group input,
            .form-group select,
            .form-group textarea {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
            }

            .student-details {
                display: flex;
                gap: 20px;
            }

            .student-photo-large img {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                object-fit: cover;
            }

            .student-info h4 {
                margin: 0 0 15px 0;
                color: #1e293b;
            }

            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }

            .info-item {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            .info-item.full-width {
                grid-column: 1 / -1;
            }

            .info-item label {
                font-weight: 500;
                color: #374151;
                font-size: 14px;
            }

            .info-item span {
                color: #64748b;
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

// Initialize student manager
window.studentManager = new StudentManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StudentManager;
}
