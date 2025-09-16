// Assignment Management System
// Handles assignment creation, viewing, submission, and grading

class AssignmentManager {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        this.assignments = [];
        this.submissions = [];
        this.initialize();
    }

    async initialize() {
        try {
            console.log('AssignmentManager initializing...');
            
            // Get current user from localStorage
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                this.currentUser = JSON.parse(savedUser);
                this.currentRole = this.currentUser.role;
                console.log('Current user:', this.currentUser);
            } else {
                console.log('No user found in localStorage');
                // Set default user for demo based on current page
                if (window.location.pathname.includes('student-dashboard')) {
                    this.currentUser = { id: 'STU001', role: 'student', username: 'student', class: '12A' };
                    this.currentRole = 'student';
                } else {
                    this.currentUser = { id: 'FAC001', role: 'faculty', username: 'faculty' };
                    this.currentRole = 'faculty';
                }
            }

            // Initialize based on role
            if (this.currentRole === 'faculty') {
                this.initializeFacultyFeatures();
            } else if (this.currentRole === 'student') {
                this.initializeStudentFeatures();
            }

            // Load assignments
            await this.loadAssignments();
            console.log('AssignmentManager initialized successfully');
        } catch (error) {
            console.error('Error initializing AssignmentManager:', error);
        }
    }

    initializeFacultyFeatures() {
        // Set up real-time listeners for faculty
        if (typeof RealtimeListeners !== 'undefined') {
            RealtimeListeners.listenToAssignments(
                { facultyId: this.currentUser.id },
                (snapshot) => {
                    this.assignments = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    this.renderFacultyAssignments();
                }
            );
        }
    }

    initializeStudentFeatures() {
        // Set up real-time listeners for students
        if (typeof RealtimeListeners !== 'undefined') {
            RealtimeListeners.listenToAssignments(
                { class: this.currentUser.class || '12A' },
                (snapshot) => {
                    this.assignments = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    this.renderStudentAssignments();
                }
            );

            // Listen to student submissions
            RealtimeListeners.listenToAssignmentSubmissions(
                this.currentUser.id,
                (snapshot) => {
                    this.submissions = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    this.renderStudentAssignments();
                }
            );
        }
    }

    async loadAssignments() {
        try {
            console.log('Loading assignments for role:', this.currentRole);
            console.log('Current user:', this.currentUser);
            
            // Load from local storage for demo
            let assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
            console.log('All assignments from storage:', assignments);
            
            // Filter assignments based on role
            if (this.currentRole === 'faculty') {
                this.assignments = assignments.filter(a => a.facultyId === (this.currentUser?.id || 'FAC001'));
                console.log('Faculty assignments:', this.assignments);
            } else if (this.currentRole === 'student') {
                const studentClass = this.currentUser?.class || '12A';
                this.assignments = assignments.filter(a => a.class === studentClass);
                console.log('Student assignments for class', studentClass, ':', this.assignments);
            } else {
                this.assignments = assignments;
            }
            
            if (this.currentRole === 'faculty') {
                this.renderFacultyAssignments();
            } else if (this.currentRole === 'student') {
                await this.loadStudentSubmissions();
                this.renderStudentAssignments();
            }
        } catch (error) {
            console.error('Error loading assignments:', error);
            this.showNotification('Error loading assignments', 'error');
        }
    }

    async loadStudentSubmissions() {
        try {
            // Load from local storage for demo
            this.submissions = JSON.parse(localStorage.getItem('submissions') || '[]')
                .filter(s => s.studentId === (this.currentUser?.id || 'STU001'));
        } catch (error) {
            console.error('Error loading submissions:', error);
        }
    }

    // Faculty Functions
    async createAssignment(event) {
        event.preventDefault();
        console.log('Create assignment form submitted');
        
        const files = document.getElementById('assignmentFiles').files;
        console.log('Files selected:', files.length);
        
        try {
            // Upload files if any
            let uploadedFiles = [];
            if (files.length > 0) {
                for (let file of files) {
                    // For demo purposes, create a mock file object
                    const mockFile = {
                        name: file.name,
                        url: URL.createObjectURL(file), // Create local URL for demo
                        size: file.size,
                        type: file.type
                    };
                    uploadedFiles.push(mockFile);
                }
            }

            // Create assignment data
            const assignmentData = {
                title: document.getElementById('assignmentTitle').value,
                subject: document.getElementById('assignmentSubject').value,
                class: document.getElementById('assignmentClass').value,
                description: document.getElementById('assignmentDescription').value,
                dueDate: new Date(document.getElementById('assignmentDueDate').value),
                maxMarks: parseInt(document.getElementById('assignmentMaxMarks').value),
                facultyId: this.currentUser?.id || 'FAC001',
                facultyName: this.currentUser?.fullName || this.currentUser?.username || 'Faculty User',
                files: uploadedFiles,
                status: 'active',
                createdAt: new Date()
            };
            
            console.log('Assignment data created:', assignmentData);

            // Generate unique ID for demo
            const assignmentId = 'ASSIGN_' + Date.now();
            assignmentData.id = assignmentId;

            // Save to local storage for demo (replace with Firebase in production)
            let assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
            assignments.push(assignmentData);
            localStorage.setItem('assignments', JSON.stringify(assignments));
            
            // Add to current assignments array
            this.assignments.push(assignmentData);
            
            // Create notifications for students
            await this.notifyStudentsAboutAssignment(assignmentData);
            
            this.showNotification('Assignment created successfully!', 'success');
            this.closeAssignmentModal();
            this.renderFacultyAssignments();
            
        } catch (error) {
            console.error('Error creating assignment:', error);
            this.showNotification('Error creating assignment: ' + error.message, 'error');
        }
    }

    async notifyStudentsAboutAssignment(assignmentData) {
        try {
            // Create notification for demo
            const notification = {
                id: 'NOTIF_' + Date.now(),
                recipientId: 'STU001',
                recipientType: 'student',
                title: 'New Assignment Posted',
                message: `New assignment "${assignmentData.title}" has been posted for ${assignmentData.subject}`,
                type: 'assignment',
                assignmentId: assignmentData.id,
                priority: 'high',
                createdAt: new Date()
            };

            // Save to local storage
            let notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
            notifications.push(notification);
            localStorage.setItem('notifications', JSON.stringify(notifications));

            console.log('Students notified about new assignment:', assignmentData.title);
        } catch (error) {
            console.error('Error notifying students:', error);
        }
    }

    renderFacultyAssignments() {
        const container = document.getElementById('assignmentsList');
        if (!container) return;

        if (this.assignments.length === 0) {
            container.innerHTML = '<div class="no-data">No assignments found. Create your first assignment!</div>';
            return;
        }

        container.innerHTML = this.assignments.map(assignment => `
            <div class="assignment-card" data-assignment-id="${assignment.id}">
                <div class="assignment-header">
                    <h3>${assignment.title}</h3>
                    <div class="assignment-meta">
                        <span class="subject">${assignment.subject}</span>
                        <span class="class">${assignment.class}</span>
                        <span class="status status-${assignment.status}">${assignment.status}</span>
                    </div>
                </div>
                <div class="assignment-content">
                    <p>${assignment.description}</p>
                    <div class="assignment-details">
                        <div class="detail-item">
                            <i class="fas fa-calendar"></i>
                            <span>Due: ${this.formatDate(assignment.dueDate)}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-star"></i>
                            <span>Max Marks: ${assignment.maxMarks}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-file"></i>
                            <span>Files: ${assignment.files ? assignment.files.length : 0}</span>
                        </div>
                    </div>
                </div>
                <div class="assignment-actions">
                    <button class="btn-secondary" onclick="assignmentManager.viewAssignmentDetails('${assignment.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn-primary" onclick="assignmentManager.viewSubmissions('${assignment.id}')">
                        <i class="fas fa-users"></i> View Submissions
                    </button>
                    <button class="btn-danger" onclick="assignmentManager.deleteAssignment('${assignment.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderStudentAssignments() {
        const container = document.getElementById('studentAssignmentsList');
        if (!container) {
            console.log('Student assignments container not found');
            return;
        }

        console.log('Rendering student assignments:', this.assignments);

        if (this.assignments.length === 0) {
            container.innerHTML = '<div class="no-data">No assignments available for your class.</div>';
            return;
        }

        container.innerHTML = this.assignments.map(assignment => {
            const submission = this.submissions.find(sub => sub.assignmentId === assignment.id);
            const isOverdue = new Date(assignment.dueDate) < new Date();
            const canSubmit = !submission && !isOverdue;
            
            return `
                <div class="assignment-card ${isOverdue ? 'overdue' : ''}" data-assignment-id="${assignment.id}">
                    <div class="assignment-header">
                        <h3>${assignment.title}</h3>
                        <div class="assignment-meta">
                            <span class="subject">${assignment.subject}</span>
                            <span class="class">${assignment.class}</span>
                            <span class="status status-${submission ? submission.status : 'pending'}">
                                ${submission ? submission.status : 'pending'}
                            </span>
                        </div>
                    </div>
                    <div class="assignment-content">
                        <p>${assignment.description}</p>
                        <div class="assignment-details">
                            <div class="detail-item">
                                <i class="fas fa-calendar"></i>
                                <span>Due: ${this.formatDate(assignment.dueDate)}</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-star"></i>
                                <span>Max Marks: ${assignment.maxMarks}</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-user"></i>
                                <span>Faculty: ${assignment.facultyName}</span>
                            </div>
                            ${submission ? `
                                <div class="detail-item">
                                    <i class="fas fa-check"></i>
                                    <span>Submitted: ${this.formatDate(submission.submittedAt)}</span>
                                </div>
                                ${submission.grade ? `
                                    <div class="detail-item">
                                        <i class="fas fa-trophy"></i>
                                        <span>Grade: ${submission.grade}/${assignment.maxMarks}</span>
                                    </div>
                                ` : ''}
                            ` : ''}
                        </div>
                    </div>
                    <div class="assignment-actions">
                        <button class="btn-secondary" onclick="assignmentManager.viewStudentAssignmentDetails('${assignment.id}')">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                        ${canSubmit ? `
                            <button class="btn-primary" onclick="assignmentManager.showSubmissionModal('${assignment.id}')">
                                <i class="fas fa-upload"></i> Submit
                            </button>
                        ` : ''}
                        ${submission && assignment.files ? `
                            <button class="btn-info" onclick="assignmentManager.downloadAssignmentFiles('${assignment.id}')">
                                <i class="fas fa-download"></i> Download Files
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Modal Functions
    showCreateAssignmentModal() {
        document.getElementById('assignmentModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeAssignmentModal() {
        document.getElementById('assignmentModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        document.getElementById('assignmentForm').reset();
        document.getElementById('filePreview').innerHTML = '';
    }

    showSubmissionModal(assignmentId) {
        const assignment = this.assignments.find(a => a.id === assignmentId);
        if (!assignment) return;

        document.getElementById('submissionAssignmentId').value = assignmentId;
        
        // Show assignment info
        document.getElementById('submissionAssignmentInfo').innerHTML = `
            <div class="assignment-preview">
                <h4>${assignment.title}</h4>
                <p><strong>Subject:</strong> ${assignment.subject}</p>
                <p><strong>Due Date:</strong> ${this.formatDate(assignment.dueDate)}</p>
                <p><strong>Description:</strong> ${assignment.description}</p>
                <p><strong>Max Marks:</strong> ${assignment.maxMarks}</p>
            </div>
        `;

        document.getElementById('assignmentSubmissionModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeAssignmentSubmissionModal() {
        document.getElementById('assignmentSubmissionModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        document.getElementById('assignmentSubmissionForm').reset();
        document.getElementById('submissionFilePreview').innerHTML = '';
    }

    async submitAssignment(event) {
        event.preventDefault();
        
        const assignmentId = document.getElementById('submissionAssignmentId').value;
        const files = document.getElementById('submissionFiles').files;
        const comments = document.getElementById('submissionComments').value;
        
        if (files.length === 0) {
            this.showNotification('Please select at least one file to submit', 'error');
            return;
        }

        try {
            // Upload submission files (demo version)
            let uploadedFiles = [];
            for (let file of files) {
                const mockFile = {
                    name: file.name,
                    url: URL.createObjectURL(file), // Create local URL for demo
                    size: file.size,
                    type: file.type
                };
                uploadedFiles.push(mockFile);
            }

            // Create submission data
            const submissionData = {
                id: 'SUB_' + Date.now(),
                assignmentId: assignmentId,
                studentId: this.currentUser.id || 'STU001',
                studentName: this.currentUser.fullName || this.currentUser.username || 'Student User',
                files: uploadedFiles,
                comments: comments,
                submittedAt: new Date(),
                status: 'submitted'
            };

            // Save to local storage for demo
            let submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
            submissions.push(submissionData);
            localStorage.setItem('submissions', JSON.stringify(submissions));
            
            // Add to current submissions array
            this.submissions.push(submissionData);
            
            // Notify faculty
            await this.notifyFacultyAboutSubmission(assignmentId, submissionData);
            
            this.showNotification('Assignment submitted successfully!', 'success');
            this.closeAssignmentSubmissionModal();
            this.renderStudentAssignments();
            
        } catch (error) {
            console.error('Error submitting assignment:', error);
            this.showNotification('Error submitting assignment: ' + error.message, 'error');
        }
    }

    async notifyFacultyAboutSubmission(assignmentId, submissionData) {
        try {
            const assignment = this.assignments.find(a => a.id === assignmentId);
            if (!assignment) return;

            const notification = {
                id: 'NOTIF_' + Date.now(),
                recipientId: assignment.facultyId,
                recipientType: 'faculty',
                title: 'New Assignment Submission',
                message: `${submissionData.studentName} submitted assignment "${assignment.title}"`,
                type: 'submission',
                assignmentId: assignmentId,
                submissionId: submissionData.id,
                priority: 'medium',
                createdAt: new Date()
            };

            // Save to local storage
            let notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
            notifications.push(notification);
            localStorage.setItem('notifications', JSON.stringify(notifications));

            console.log('Faculty notified about submission:', submissionData.studentName);
        } catch (error) {
            console.error('Error notifying faculty:', error);
        }
    }

    // File handling
    handleFileSelection(event) {
        const files = event.target.files;
        const preview = document.getElementById('filePreview');
        
        preview.innerHTML = '';
        
        Array.from(files).forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <i class="fas fa-file"></i>
                <span>${file.name}</span>
                <span class="file-size">(${this.formatFileSize(file.size)})</span>
            `;
            preview.appendChild(fileItem);
        });
    }

    handleSubmissionFileSelection(event) {
        const files = event.target.files;
        const preview = document.getElementById('submissionFilePreview');
        
        preview.innerHTML = '';
        
        Array.from(files).forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <i class="fas fa-file"></i>
                <span>${file.name}</span>
                <span class="file-size">(${this.formatFileSize(file.size)})</span>
            `;
            preview.appendChild(fileItem);
        });
    }

    // Utility functions
    formatDate(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            font-weight: 500;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    // Filter functions
    filterAssignments() {
        const classFilter = document.getElementById('assignmentClassFilter')?.value;
        const subjectFilter = document.getElementById('assignmentSubjectFilter')?.value;
        const statusFilter = document.getElementById('assignmentStatusFilter')?.value;
        
        // Implement filtering logic here
        this.renderFacultyAssignments();
    }

    filterStudentAssignments() {
        const statusFilter = document.getElementById('studentAssignmentFilter')?.value;
        
        // Implement filtering logic here
        this.renderStudentAssignments();
    }

    // Refresh assignments function
    async refreshAssignments() {
        console.log('Refreshing assignments...');
        await this.loadAssignments();
    }

    // View functions
    async viewAssignmentDetails(assignmentId) {
        const assignment = this.assignments.find(a => a.id === assignmentId);
        if (!assignment) return;

        const content = document.getElementById('assignmentDetailsContent');
        content.innerHTML = `
            <div class="assignment-details-full">
                <h3>${assignment.title}</h3>
                <div class="details-grid">
                    <div class="detail-group">
                        <label>Subject:</label>
                        <span>${assignment.subject}</span>
                    </div>
                    <div class="detail-group">
                        <label>Class:</label>
                        <span>${assignment.class}</span>
                    </div>
                    <div class="detail-group">
                        <label>Due Date:</label>
                        <span>${this.formatDate(assignment.dueDate)}</span>
                    </div>
                    <div class="detail-group">
                        <label>Max Marks:</label>
                        <span>${assignment.maxMarks}</span>
                    </div>
                    <div class="detail-group">
                        <label>Status:</label>
                        <span class="status status-${assignment.status}">${assignment.status}</span>
                    </div>
                </div>
                <div class="description">
                    <label>Description:</label>
                    <p>${assignment.description}</p>
                </div>
                ${assignment.files && assignment.files.length > 0 ? `
                    <div class="files-section">
                        <label>Attached Files:</label>
                        <div class="files-list">
                            ${assignment.files.map(file => `
                                <div class="file-item">
                                    <i class="fas fa-file"></i>
                                    <a href="${file.url}" target="_blank">${file.name}</a>
                                    <span class="file-size">(${this.formatFileSize(file.size)})</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        document.getElementById('assignmentDetailsModal').style.display = 'block';
    }

    closeAssignmentDetailsModal() {
        document.getElementById('assignmentDetailsModal').style.display = 'none';
    }

    async viewStudentAssignmentDetails(assignmentId) {
        const assignment = this.assignments.find(a => a.id === assignmentId);
        if (!assignment) return;

        const submission = this.submissions.find(sub => sub.assignmentId === assignmentId);

        const content = document.getElementById('studentAssignmentDetailsContent');
        content.innerHTML = `
            <div class="assignment-details-full">
                <h3>${assignment.title}</h3>
                <div class="details-grid">
                    <div class="detail-group">
                        <label>Subject:</label>
                        <span>${assignment.subject}</span>
                    </div>
                    <div class="detail-group">
                        <label>Class:</label>
                        <span>${assignment.class}</span>
                    </div>
                    <div class="detail-group">
                        <label>Due Date:</label>
                        <span>${this.formatDate(assignment.dueDate)}</span>
                    </div>
                    <div class="detail-group">
                        <label>Max Marks:</label>
                        <span>${assignment.maxMarks}</span>
                    </div>
                    <div class="detail-group">
                        <label>Faculty:</label>
                        <span>${assignment.facultyName}</span>
                    </div>
                    ${submission ? `
                        <div class="detail-group">
                            <label>Submission Status:</label>
                            <span class="status status-${submission.status}">${submission.status}</span>
                        </div>
                        <div class="detail-group">
                            <label>Submitted On:</label>
                            <span>${this.formatDate(submission.submittedAt)}</span>
                        </div>
                        ${submission.grade ? `
                            <div class="detail-group">
                                <label>Grade:</label>
                                <span>${submission.grade}/${assignment.maxMarks}</span>
                            </div>
                        ` : ''}
                    ` : ''}
                </div>
                <div class="description">
                    <label>Description:</label>
                    <p>${assignment.description}</p>
                </div>
                ${assignment.files && assignment.files.length > 0 ? `
                    <div class="files-section">
                        <label>Assignment Files:</label>
                        <div class="files-list">
                            ${assignment.files.map(file => `
                                <div class="file-item">
                                    <i class="fas fa-file"></i>
                                    <a href="${file.url}" target="_blank">${file.name}</a>
                                    <span class="file-size">(${this.formatFileSize(file.size)})</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                ${submission && submission.files ? `
                    <div class="files-section">
                        <label>Your Submission:</label>
                        <div class="files-list">
                            ${submission.files.map(file => `
                                <div class="file-item">
                                    <i class="fas fa-file"></i>
                                    <a href="${file.url}" target="_blank">${file.name}</a>
                                    <span class="file-size">(${this.formatFileSize(file.size)})</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        document.getElementById('studentAssignmentDetailsModal').style.display = 'block';
    }

    closeStudentAssignmentDetailsModal() {
        document.getElementById('studentAssignmentDetailsModal').style.display = 'none';
    }

    // Download functions
    downloadAssignmentFiles(assignmentId) {
        const assignment = this.assignments.find(a => a.id === assignmentId);
        if (!assignment || !assignment.files) return;

        assignment.files.forEach(file => {
            const link = document.createElement('a');
            link.href = file.url;
            link.download = file.name;
            link.target = '_blank';
            link.click();
        });
    }

    // Delete function
    async deleteAssignment(assignmentId) {
        if (!confirm('Are you sure you want to delete this assignment?')) return;

        try {
            await DatabaseHelper.deleteAssignment(assignmentId);
            this.showNotification('Assignment deleted successfully', 'success');
            this.loadAssignments();
        } catch (error) {
            console.error('Error deleting assignment:', error);
            this.showNotification('Error deleting assignment: ' + error.message, 'error');
        }
    }
}

// Initialize assignment manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a dashboard page
    if (document.getElementById('assignmentsList') || document.getElementById('studentAssignmentsList')) {
        console.log('Initializing Assignment Manager...');
        window.assignmentManager = new AssignmentManager();
        console.log('Assignment Manager initialized successfully');
        
        // Force load assignments after a short delay to ensure everything is ready
        setTimeout(() => {
            if (window.assignmentManager) {
                console.log('Force loading assignments...');
                window.assignmentManager.loadAssignments();
            }
        }, 1000);
    }
});

// Global functions for HTML onclick handlers
window.showCreateAssignmentModal = function() {
    console.log('showCreateAssignmentModal called');
    if (window.assignmentManager) {
        window.assignmentManager.showCreateAssignmentModal();
    } else {
        console.error('Assignment manager not initialized');
        alert('Assignment manager not initialized. Please refresh the page.');
    }
};

window.closeAssignmentModal = function() {
    if (window.assignmentManager) {
        window.assignmentManager.closeAssignmentModal();
    }
};

window.closeAssignmentDetailsModal = function() {
    if (window.assignmentManager) {
        window.assignmentManager.closeAssignmentDetailsModal();
    }
};

window.closeAssignmentSubmissionModal = function() {
    if (window.assignmentManager) {
        window.assignmentManager.closeAssignmentSubmissionModal();
    }
};

window.closeStudentAssignmentDetailsModal = function() {
    if (window.assignmentManager) {
        window.assignmentManager.closeStudentAssignmentDetailsModal();
    }
};

window.createAssignment = function(event) {
    console.log('createAssignment called');
    if (window.assignmentManager) {
        window.assignmentManager.createAssignment(event);
    } else {
        console.error('Assignment manager not initialized');
        alert('Assignment manager not initialized. Please refresh the page.');
    }
};

window.submitAssignment = function(event) {
    if (window.assignmentManager) {
        window.assignmentManager.submitAssignment(event);
    }
};

window.handleFileSelection = function(event) {
    if (window.assignmentManager) {
        window.assignmentManager.handleFileSelection(event);
    }
};

window.handleSubmissionFileSelection = function(event) {
    if (window.assignmentManager) {
        window.assignmentManager.handleSubmissionFileSelection(event);
    }
};

window.filterAssignments = function() {
    if (window.assignmentManager) {
        window.assignmentManager.filterAssignments();
    }
};

window.filterStudentAssignments = function() {
    if (window.assignmentManager) {
        window.assignmentManager.filterStudentAssignments();
    }
};

window.refreshAssignments = function() {
    if (window.assignmentManager) {
        window.assignmentManager.refreshAssignments();
    }
};
