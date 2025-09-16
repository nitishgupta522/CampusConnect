// Faculty Management Module for Admin Dashboard
// Handles faculty CRUD operations, department management, and scheduling

class FacultyManager {
    constructor() {
        this.faculty = [];
        this.departments = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Social Studies', 'Computer Science', 'Physical Education'];
        this.currentFilter = {
            department: 'all',
            status: 'all',
            search: ''
        };
        this.init();
    }

    init() {
        this.loadFaculty();
        this.setupEventListeners();
    }

    // Load faculty data
    async loadFaculty() {
        try {
            if (typeof DatabaseHelper !== 'undefined') {
                const snapshot = await db.collection('faculty').orderBy('name').get();
                this.faculty = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else {
                // Fallback to localStorage
                const registeredFaculty = JSON.parse(localStorage.getItem('registeredFaculty') || '[]');
                const sampleFaculty = JSON.parse(localStorage.getItem('sampleFaculty') || '[]');
                this.faculty = [...registeredFaculty, ...sampleFaculty];
            }
        } catch (error) {
            console.error('Error loading faculty:', error);
            this.faculty = [];
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for real-time updates
        if (typeof RealtimeListeners !== 'undefined') {
            db.collection('faculty').onSnapshot((snapshot) => {
                const changes = snapshot.docChanges();
                changes.forEach(change => {
                    if (change.type === 'added' || change.type === 'modified') {
                        const data = { id: change.doc.id, ...change.doc.data() };
                        this.updateFacultyData(data);
                    } else if (change.type === 'removed') {
                        this.removeFacultyData(change.doc.id);
                    }
                });
            });
        }
    }

    // Update faculty data
    updateFacultyData(newData) {
        const existingIndex = this.faculty.findIndex(faculty => faculty.id === newData.id);
        if (existingIndex >= 0) {
            this.faculty[existingIndex] = newData;
        } else {
            this.faculty.unshift(newData);
        }
        this.renderFacultyTable();
    }

    // Remove faculty data
    removeFacultyData(facultyId) {
        this.faculty = this.faculty.filter(faculty => faculty.id !== facultyId);
        this.renderFacultyTable();
    }

    // Render faculty management interface
    renderFacultyInterface() {
        return `
            <div class="faculty-management-container">
                <div class="faculty-header">
                    <h2><i class="fas fa-chalkboard-teacher"></i> Faculty Management</h2>
                    <div class="faculty-actions">
                        <button class="btn-primary" onclick="facultyManager.openAddFacultyModal()">
                            <i class="fas fa-user-plus"></i> Add New Faculty
                        </button>
                        <button class="btn-secondary" onclick="facultyManager.exportFacultyData()">
                            <i class="fas fa-download"></i> Export Data
                        </button>
                    </div>
                </div>

                <div class="faculty-filters">
                    <div class="filter-group">
                        <label>Department:</label>
                        <select id="facultyDepartmentFilter" onchange="facultyManager.filterFaculty()">
                            <option value="all">All Departments</option>
                            ${this.departments.map(dept => `<option value="${dept}">${dept}</option>`).join('')}
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Status:</label>
                        <select id="facultyStatusFilter" onchange="facultyManager.filterFaculty()">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Search:</label>
                        <input type="text" id="facultySearch" placeholder="Search by name or employee ID..." 
                               onkeyup="facultyManager.filterFaculty()">
                    </div>
                </div>

                <div class="faculty-stats">
                    <div class="stat-card">
                        <div class="stat-value" id="totalFacultyCount">0</div>
                        <div class="stat-label">Total Faculty</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="activeFacultyCount">0</div>
                        <div class="stat-label">Active Faculty</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="pendingFacultyCount">0</div>
                        <div class="stat-label">Pending Approval</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="avgExperience">0</div>
                        <div class="stat-label">Avg Experience (Years)</div>
                    </div>
                </div>

                <div class="faculty-table-container">
                    <table class="faculty-table" id="facultyTable">
                        <thead>
                            <tr>
                                <th>Photo</th>
                                <th>Name</th>
                                <th>Employee ID</th>
                                <th>Department</th>
                                <th>Subject</th>
                                <th>Experience</th>
                                <th>Contact</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="facultyTableBody">
                            <tr>
                                <td colspan="9" class="loading">Loading faculty data...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="faculty-charts">
                    <div class="chart-container">
                        <h3>Department Distribution</h3>
                        <canvas id="departmentDistributionChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3>Experience Distribution</h3>
                        <canvas id="experienceDistributionChart"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    // Render faculty table
    renderFacultyTable() {
        const tbody = document.getElementById('facultyTableBody');
        if (!tbody) return;

        const filteredFaculty = this.getFilteredFaculty();

        if (filteredFaculty.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="no-data">No faculty found</td></tr>';
            return;
        }

        tbody.innerHTML = filteredFaculty.map(faculty => `
            <tr>
                <td>
                    <div class="faculty-photo">
                        <img src="${faculty.photo || 'https://via.placeholder.com/40x40'}" 
                             alt="${faculty.name || faculty.fullName}" 
                             onerror="this.src='https://via.placeholder.com/40x40'">
                    </div>
                </td>
                <td>
                    <div class="faculty-name">
                        <strong>${faculty.name || faculty.fullName}</strong>
                        <div class="faculty-email">${faculty.email}</div>
                    </div>
                </td>
                <td>${faculty.employeeId || 'N/A'}</td>
                <td>${faculty.department || 'N/A'}</td>
                <td>${faculty.subject || faculty.subjects?.join(', ') || 'N/A'}</td>
                <td>${faculty.experience || 0} years</td>
                <td>
                    <div class="contact-info">
                        <div>${faculty.phoneNumber || faculty.phone || 'N/A'}</div>
                        <div class="address">${faculty.address || 'N/A'}</div>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${faculty.status || 'active'}">
                        ${(faculty.status || 'active').toUpperCase()}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-view" onclick="facultyManager.viewFaculty('${faculty.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-edit" onclick="facultyManager.editFaculty('${faculty.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="facultyManager.deleteFaculty('${faculty.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updateFacultyStats();
    }

    // Get filtered faculty
    getFilteredFaculty() {
        let filtered = [...this.faculty];

        // Filter by department
        if (this.currentFilter.department !== 'all') {
            filtered = filtered.filter(faculty => faculty.department === this.currentFilter.department);
        }

        // Filter by status
        if (this.currentFilter.status !== 'all') {
            filtered = filtered.filter(faculty => (faculty.status || 'active') === this.currentFilter.status);
        }

        // Filter by search
        if (this.currentFilter.search) {
            const searchTerm = this.currentFilter.search.toLowerCase();
            filtered = filtered.filter(faculty => 
                (faculty.name || faculty.fullName || '').toLowerCase().includes(searchTerm) ||
                (faculty.employeeId || '').toLowerCase().includes(searchTerm) ||
                (faculty.email || '').toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }

    // Update faculty statistics
    updateFacultyStats() {
        const totalFaculty = this.faculty.length;
        const activeFaculty = this.faculty.filter(faculty => (faculty.status || 'active') === 'active').length;
        const pendingFaculty = this.faculty.filter(faculty => (faculty.status || 'active') === 'pending').length;
        
        // Calculate average experience
        const totalExperience = this.faculty.reduce((sum, faculty) => sum + (faculty.experience || 0), 0);
        const avgExperience = totalFaculty > 0 ? Math.round(totalExperience / totalFaculty * 10) / 10 : 0;

        const totalFacultyEl = document.getElementById('totalFacultyCount');
        const activeFacultyEl = document.getElementById('activeFacultyCount');
        const pendingFacultyEl = document.getElementById('pendingFacultyCount');
        const avgExperienceEl = document.getElementById('avgExperience');

        if (totalFacultyEl) totalFacultyEl.textContent = totalFaculty;
        if (activeFacultyEl) activeFacultyEl.textContent = activeFaculty;
        if (pendingFacultyEl) pendingFacultyEl.textContent = pendingFaculty;
        if (avgExperienceEl) avgExperienceEl.textContent = avgExperience;
    }

    // Filter faculty
    filterFaculty() {
        this.currentFilter.department = document.getElementById('facultyDepartmentFilter')?.value || 'all';
        this.currentFilter.status = document.getElementById('facultyStatusFilter')?.value || 'all';
        this.currentFilter.search = document.getElementById('facultySearch')?.value || '';

        this.renderFacultyTable();
        this.renderCharts();
    }

    // Open add faculty modal
    openAddFacultyModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content add-faculty-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-user-plus"></i> Add New Faculty</h3>
                    <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="addFacultyForm" onsubmit="facultyManager.submitNewFaculty(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <label>First Name *</label>
                                <input type="text" id="newFacultyFirstName" required>
                            </div>
                            <div class="form-group">
                                <label>Last Name *</label>
                                <input type="text" id="newFacultyLastName" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Email *</label>
                                <input type="email" id="newFacultyEmail" required>
                            </div>
                            <div class="form-group">
                                <label>Phone Number *</label>
                                <input type="tel" id="newFacultyPhone" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Employee ID *</label>
                                <input type="text" id="newFacultyEmployeeId" required>
                            </div>
                            <div class="form-group">
                                <label>Department *</label>
                                <select id="newFacultyDepartment" required>
                                    <option value="">Select Department</option>
                                    ${this.departments.map(dept => `<option value="${dept}">${dept}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Subject *</label>
                                <input type="text" id="newFacultySubject" required>
                            </div>
                            <div class="form-group">
                                <label>Experience (Years) *</label>
                                <input type="number" id="newFacultyExperience" min="0" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Qualification *</label>
                                <input type="text" id="newFacultyQualification" required>
                            </div>
                            <div class="form-group">
                                <label>Joining Date *</label>
                                <input type="date" id="newFacultyJoiningDate" value="${new Date().toISOString().split('T')[0]}" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Address *</label>
                            <textarea id="newFacultyAddress" rows="3" required></textarea>
                        </div>
                        <div class="form-group">
                            <label>Photo</label>
                            <input type="file" id="newFacultyPhoto" accept="image/*">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Cancel</button>
                    <button class="btn-primary" onclick="facultyManager.submitNewFaculty()">Add Faculty</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Submit new faculty
    async submitNewFaculty(event) {
        if (event) event.preventDefault();

        const form = document.getElementById('addFacultyForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const facultyData = {
            firstName: document.getElementById('newFacultyFirstName').value.trim(),
            lastName: document.getElementById('newFacultyLastName').value.trim(),
            email: document.getElementById('newFacultyEmail').value.trim(),
            phoneNumber: document.getElementById('newFacultyPhone').value.trim(),
            employeeId: document.getElementById('newFacultyEmployeeId').value.trim(),
            department: document.getElementById('newFacultyDepartment').value,
            subject: document.getElementById('newFacultySubject').value.trim(),
            experience: parseInt(document.getElementById('newFacultyExperience').value),
            qualification: document.getElementById('newFacultyQualification').value.trim(),
            joiningDate: document.getElementById('newFacultyJoiningDate').value,
            address: document.getElementById('newFacultyAddress').value.trim(),
            status: 'active',
            role: 'faculty',
            createdAt: new Date().toISOString()
        };

        try {
            let facultyId;
            
            if (typeof DatabaseHelper !== 'undefined') {
                // Use Firebase
                facultyId = await DatabaseHelper.registerUser(facultyData, 'faculty');
            } else {
                // Fallback to localStorage
                facultyId = 'FAC' + Date.now().toString().slice(-6);
                facultyData.id = facultyId;
                
                let faculty = JSON.parse(localStorage.getItem('registeredFaculty') || '[]');
                faculty.push(facultyData);
                localStorage.setItem('registeredFaculty', JSON.stringify(faculty));
            }

            // Update local data
            this.faculty.unshift({ id: facultyId, ...facultyData });
            this.renderFacultyTable();

            alert('Faculty added successfully!');
            
            // Close modal
            document.querySelector('.add-faculty-modal').parentElement.remove();

        } catch (error) {
            console.error('Error adding faculty:', error);
            alert('Error adding faculty. Please try again.');
        }
    }

    // View faculty details
    viewFaculty(facultyId) {
        const faculty = this.faculty.find(f => f.id === facultyId);
        if (!faculty) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content view-faculty-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-user"></i> Faculty Details</h3>
                    <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="faculty-details">
                        <div class="faculty-photo-large">
                            <img src="${faculty.photo || 'https://via.placeholder.com/120x120'}" 
                                 alt="${faculty.name || faculty.fullName}"
                                 onerror="this.src='https://via.placeholder.com/120x120'">
                        </div>
                        <div class="faculty-info">
                            <h4>${faculty.name || faculty.fullName}</h4>
                            <div class="info-grid">
                                <div class="info-item">
                                    <label>Employee ID:</label>
                                    <span>${faculty.employeeId || 'N/A'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Department:</label>
                                    <span>${faculty.department || 'N/A'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Subject:</label>
                                    <span>${faculty.subject || faculty.subjects?.join(', ') || 'N/A'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Experience:</label>
                                    <span>${faculty.experience || 0} years</span>
                                </div>
                                <div class="info-item">
                                    <label>Qualification:</label>
                                    <span>${faculty.qualification || 'N/A'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Email:</label>
                                    <span>${faculty.email}</span>
                                </div>
                                <div class="info-item">
                                    <label>Phone:</label>
                                    <span>${faculty.phoneNumber || faculty.phone || 'N/A'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Joining Date:</label>
                                    <span>${this.formatDate(faculty.joiningDate || faculty.createdAt)}</span>
                                </div>
                                <div class="info-item">
                                    <label>Status:</label>
                                    <span class="status-badge ${faculty.status || 'active'}">${(faculty.status || 'active').toUpperCase()}</span>
                                </div>
                                <div class="info-item full-width">
                                    <label>Address:</label>
                                    <span>${faculty.address || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Close</button>
                    <button class="btn-primary" onclick="facultyManager.editFaculty('${facultyId}')">Edit Faculty</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Edit faculty
    editFaculty(facultyId) {
        const faculty = this.faculty.find(f => f.id === facultyId);
        if (!faculty) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content edit-faculty-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Edit Faculty</h3>
                    <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="editFacultyForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label>First Name *</label>
                                <input type="text" id="editFacultyFirstName" value="${faculty.firstName || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Last Name *</label>
                                <input type="text" id="editFacultyLastName" value="${faculty.lastName || ''}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Email *</label>
                                <input type="email" id="editFacultyEmail" value="${faculty.email || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Phone Number *</label>
                                <input type="tel" id="editFacultyPhone" value="${faculty.phoneNumber || faculty.phone || ''}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Department *</label>
                                <select id="editFacultyDepartment" required>
                                    <option value="">Select Department</option>
                                    ${this.departments.map(dept => 
                                        `<option value="${dept}" ${faculty.department === dept ? 'selected' : ''}>${dept}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Subject *</label>
                                <input type="text" id="editFacultySubject" value="${faculty.subject || ''}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Experience (Years) *</label>
                                <input type="number" id="editFacultyExperience" value="${faculty.experience || 0}" min="0" required>
                            </div>
                            <div class="form-group">
                                <label>Status *</label>
                                <select id="editFacultyStatus" required>
                                    <option value="active" ${(faculty.status || 'active') === 'active' ? 'selected' : ''}>Active</option>
                                    <option value="inactive" ${faculty.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                    <option value="pending" ${faculty.status === 'pending' ? 'selected' : ''}>Pending</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Address *</label>
                            <textarea id="editFacultyAddress" rows="3" required>${faculty.address || ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Cancel</button>
                    <button class="btn-primary" onclick="facultyManager.updateFaculty('${facultyId}')">Update Faculty</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Update faculty
    async updateFaculty(facultyId) {
        const form = document.getElementById('editFacultyForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const updateData = {
            firstName: document.getElementById('editFacultyFirstName').value.trim(),
            lastName: document.getElementById('editFacultyLastName').value.trim(),
            email: document.getElementById('editFacultyEmail').value.trim(),
            phoneNumber: document.getElementById('editFacultyPhone').value.trim(),
            department: document.getElementById('editFacultyDepartment').value,
            subject: document.getElementById('editFacultySubject').value.trim(),
            experience: parseInt(document.getElementById('editFacultyExperience').value),
            status: document.getElementById('editFacultyStatus').value,
            address: document.getElementById('editFacultyAddress').value.trim(),
            updatedAt: new Date().toISOString()
        };

        try {
            if (typeof DatabaseHelper !== 'undefined') {
                // Use Firebase
                await db.collection('faculty').doc(facultyId).update(updateData);
            } else {
                // Update in localStorage
                let faculty = JSON.parse(localStorage.getItem('registeredFaculty') || '[]');
                const index = faculty.findIndex(f => f.id === facultyId);
                if (index >= 0) {
                    faculty[index] = { ...faculty[index], ...updateData };
                    localStorage.setItem('registeredFaculty', JSON.stringify(faculty));
                }
            }

            // Update local data
            const index = this.faculty.findIndex(f => f.id === facultyId);
            if (index >= 0) {
                this.faculty[index] = { ...this.faculty[index], ...updateData };
            }

            this.renderFacultyTable();
            alert('Faculty updated successfully!');

            // Close modal
            document.querySelector('.edit-faculty-modal').parentElement.remove();

        } catch (error) {
            console.error('Error updating faculty:', error);
            alert('Error updating faculty. Please try again.');
        }
    }

    // Delete faculty
    async deleteFaculty(facultyId) {
        if (!confirm('Are you sure you want to delete this faculty member? This action cannot be undone.')) {
            return;
        }

        try {
            if (typeof DatabaseHelper !== 'undefined') {
                // Use Firebase
                await db.collection('faculty').doc(facultyId).delete();
            } else {
                // Remove from localStorage
                let faculty = JSON.parse(localStorage.getItem('registeredFaculty') || '[]');
                faculty = faculty.filter(f => f.id !== facultyId);
                localStorage.setItem('registeredFaculty', JSON.stringify(faculty));
            }

            // Remove from local data
            this.faculty = this.faculty.filter(f => f.id !== facultyId);
            this.renderFacultyTable();

            alert('Faculty deleted successfully!');

        } catch (error) {
            console.error('Error deleting faculty:', error);
            alert('Error deleting faculty. Please try again.');
        }
    }

    // Export faculty data
    exportFacultyData() {
        const filteredFaculty = this.getFilteredFaculty();
        
        if (filteredFaculty.length === 0) {
            alert('No data to export');
            return;
        }

        const csvData = filteredFaculty.map(faculty => ({
            'Name': faculty.name || faculty.fullName,
            'Employee ID': faculty.employeeId,
            'Department': faculty.department,
            'Subject': faculty.subject || faculty.subjects?.join(', '),
            'Experience': faculty.experience,
            'Email': faculty.email,
            'Phone': faculty.phoneNumber || faculty.phone,
            'Status': faculty.status || 'active',
            'Joining Date': faculty.joiningDate || faculty.createdAt
        }));

        DashboardUtils.exportToCSV(csvData, `faculty_${new Date().toISOString().split('T')[0]}.csv`);
    }

    // Render charts
    renderCharts() {
        this.renderDepartmentDistributionChart();
        this.renderExperienceDistributionChart();
    }

    // Render department distribution chart
    renderDepartmentDistributionChart() {
        const canvas = document.getElementById('departmentDistributionChart');
        if (!canvas || typeof Chart === 'undefined') return;

        const departmentData = {};
        this.faculty.forEach(faculty => {
            const department = faculty.department || 'Unknown';
            departmentData[department] = (departmentData[department] || 0) + 1;
        });

        const departments = Object.keys(departmentData);
        const counts = Object.values(departmentData);

        new Chart(canvas, {
            type: 'pie',
            data: {
                labels: departments,
                datasets: [{
                    data: counts,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 205, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(153, 102, 255, 0.5)',
                        'rgba(255, 159, 64, 0.5)',
                        'rgba(199, 199, 199, 0.5)',
                        'rgba(83, 102, 255, 0.5)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 205, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(199, 199, 199, 1)',
                        'rgba(83, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Faculty Distribution by Department'
                    }
                }
            }
        });
    }

    // Render experience distribution chart
    renderExperienceDistributionChart() {
        const canvas = document.getElementById('experienceDistributionChart');
        if (!canvas || typeof Chart === 'undefined') return;

        const experienceRanges = {
            '0-2 years': 0,
            '3-5 years': 0,
            '6-10 years': 0,
            '11-15 years': 0,
            '16+ years': 0
        };

        this.faculty.forEach(faculty => {
            const experience = faculty.experience || 0;
            if (experience <= 2) experienceRanges['0-2 years']++;
            else if (experience <= 5) experienceRanges['3-5 years']++;
            else if (experience <= 10) experienceRanges['6-10 years']++;
            else if (experience <= 15) experienceRanges['11-15 years']++;
            else experienceRanges['16+ years']++;
        });

        const ranges = Object.keys(experienceRanges);
        const counts = Object.values(experienceRanges);

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ranges,
                datasets: [{
                    label: 'Number of Faculty',
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
                        text: 'Faculty Experience Distribution'
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
        if (document.getElementById('faculty-management-styles')) return;

        const style = document.createElement('style');
        style.id = 'faculty-management-styles';
        style.textContent = `
            .faculty-management-container {
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                margin-bottom: 20px;
            }

            .faculty-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 2px solid #f0f0f0;
            }

            .faculty-header h2 {
                color: #1e293b;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .faculty-actions {
                display: flex;
                gap: 10px;
            }

            .faculty-filters {
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

            .faculty-stats {
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

            .faculty-table-container {
                overflow-x: auto;
                margin-bottom: 25px;
            }

            .faculty-table {
                width: 100%;
                border-collapse: collapse;
                background: white;
            }

            .faculty-table th,
            .faculty-table td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #e2e8f0;
            }

            .faculty-table th {
                background: #f8fafc;
                font-weight: 600;
                color: #374151;
            }

            .faculty-photo img {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                object-fit: cover;
            }

            .faculty-name strong {
                color: #1e293b;
            }

            .faculty-email {
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

            .faculty-charts {
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

            .add-faculty-modal, .edit-faculty-modal {
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

            .faculty-details {
                display: flex;
                gap: 20px;
            }

            .faculty-photo-large img {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                object-fit: cover;
            }

            .faculty-info h4 {
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

// Initialize faculty manager
window.facultyManager = new FacultyManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FacultyManager;
}
