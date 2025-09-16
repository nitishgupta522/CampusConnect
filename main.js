// Global Variables
let currentUser = null;
let currentRole = 'admin';

// DOM Elements
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const roleButtons = document.querySelectorAll('.role-btn');

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthState();
});

function initializeApp() {
    console.log('School Management System Initialized');
    
    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add animation on scroll
    addScrollAnimations();
}

function setupEventListeners() {
    // Role selection buttons
    roleButtons.forEach(button => {
        button.addEventListener('click', function() {
            roleButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentRole = this.getAttribute('data-role');
        });
    });
    
    // Login form submission
    loginForm.addEventListener('submit', handleLogin);
    
    // Close modal when clicking outside
    loginModal.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            closeLoginModal();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && loginModal.style.display === 'block') {
            closeLoginModal();
        }
    });
}

// Modal Functions
function showLoginModal() {
    loginModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Focus on username field
    setTimeout(() => {
        document.getElementById('username').focus();
    }, 300);
}

function closeLoginModal() {
    loginModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form
    loginForm.reset();
    showMessage('', 'clear');
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showMessage('Please enter both username and password', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('.btn-login-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Logging in...';
    submitBtn.disabled = true;
    
    try {
        // Simulate authentication (replace with real Firebase auth)
        const user = await authenticateUser(username, password, currentRole);
        
        if (user) {
            currentUser = user;
            showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect to appropriate dashboard after delay
            setTimeout(() => {
                redirectToDashboard(currentRole);
            }, 1500);
        } else {
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Login failed. Please check your credentials.', 'error');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function authenticateUser(username, password, role) {
    // Demo credentials for testing
    const demoCredentials = {
        admin: { username: 'admin', password: 'admin123' },
        faculty: { username: 'faculty', password: 'faculty123' },
        student: { username: 'student', password: 'student123' },
        parent: { username: 'parent', password: 'parent123' }
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // First check demo credentials
    const credentials = demoCredentials[role];
    if (credentials && username === credentials.username && password === credentials.password) {
        return {
            id: Math.random().toString(36).substr(2, 9),
            username: username,
            role: role,
            fullName: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
            email: `${username}@school.edu`
        };
    }
    
    // Check registered users
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = registeredUsers.find(u => 
        (u.username === username || u.email === username) && 
        u.password === password && 
        u.role === role
    );
    
    if (user) {
        return {
            id: user.id,
            username: user.username,
            role: user.role,
            fullName: user.fullName,
            email: user.email,
            class: user.class,
            department: user.department,
            studentRollNumber: user.studentRollNumber
        };
    }
    
    return null;
}

function checkAuthState() {
    // Check if user is already logged in (localStorage for demo)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        // Could redirect to dashboard here if needed
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Dashboard Redirection
function redirectToDashboard(role) {
    // Save user data
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Redirect to appropriate dashboard
    const dashboards = {
        admin: 'admin-dashboard.html',
        faculty: 'faculty-dashboard.html',
        student: 'student-dashboard.html',
        parent: 'parent-dashboard.html'
    };
    
    window.location.href = dashboards[role] || 'admin-dashboard.html';
}

function quickLogin(role) {
    currentRole = role;
    
    // Update role selector
    roleButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-role="${role}"]`).classList.add('active');
    
    // Pre-fill credentials for demo
    const demoCredentials = {
        admin: { username: 'admin', password: 'admin123' },
        faculty: { username: 'faculty', password: 'faculty123' },
        student: { username: 'student', password: 'student123' },
        parent: { username: 'parent', password: 'parent123' }
    };
    
    showLoginModal();
    
    // Pre-fill form
    setTimeout(() => {
        document.getElementById('username').value = demoCredentials[role].username;
        document.getElementById('password').value = demoCredentials[role].password;
    }, 300);
}

// Utility Functions
function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    if (type === 'clear') return;
    
    // Create new message element
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    
    // Insert after form
    loginForm.insertAdjacentElement('afterend', messageElement);
    
    // Auto remove success messages
    if (type === 'success') {
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
}

function showDemo() {
    alert('Demo video coming soon! For now, try logging in with:\n\nAdmin: admin/admin123\nFaculty: faculty/faculty123\nStudent: student/student123\nParent: parent/parent123');
}

function showForgotPassword() {
    alert('Forgot password functionality will redirect to password recovery page.');
}

function showRegistration() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('registrationModal').style.display = 'block';
}

function closeRegistrationModal() {
    document.getElementById('registrationModal').style.display = 'none';
    // Clear all forms
    clearAllRegistrationForms();
}

function showRegistrationTab(tabName) {
    // Hide all registration forms
    document.querySelectorAll('.registration-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected form and activate tab
    document.getElementById(tabName + 'Registration').classList.add('active');
    event.target.classList.add('active');
}

function clearAllRegistrationForms() {
    // Clear student form
    document.getElementById('studentForm').reset();
    clearFormErrors('studentForm');
    
    // Clear faculty form
    document.getElementById('facultyForm').reset();
    clearFormErrors('facultyForm');
    
    // Clear parent form
    document.getElementById('parentForm').reset();
    clearFormErrors('parentForm');
}

function clearFormErrors(formId) {
    const form = document.getElementById(formId);
    form.querySelectorAll('.error').forEach(element => {
        element.classList.remove('error');
    });
    form.querySelectorAll('.error-message').forEach(element => {
        element.remove();
    });
}

function showFormError(inputId, message) {
    const input = document.getElementById(inputId);
    input.classList.add('error');
    
    // Remove existing error message
    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    input.parentNode.appendChild(errorDiv);
}

function clearFormError(inputId) {
    const input = document.getElementById(inputId);
    input.classList.remove('error');
    const errorMessage = input.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function validateForm(formId) {
    let isValid = true;
    const form = document.getElementById(formId);
    
    // Clear previous errors
    clearFormErrors(formId);
    
    // Get all required inputs
    const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            showFormError(input.id, 'This field is required');
            isValid = false;
        } else {
            clearFormError(input.id);
        }
    });
    
    // Validate email format
    const emailInputs = form.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        if (input.value && !isValidEmail(input.value)) {
            showFormError(input.id, 'Please enter a valid email address');
            isValid = false;
        }
    });
    
    // Validate password confirmation
    const passwordInputs = form.querySelectorAll('input[type="password"]');
    if (passwordInputs.length >= 2) {
        const password = passwordInputs[0].value;
        const confirmPassword = passwordInputs[1].value;
        
        if (password && confirmPassword && password !== confirmPassword) {
            showFormError(passwordInputs[1].id, 'Passwords do not match');
            isValid = false;
        }
    }
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Student Registration
async function handleStudentRegistration(event) {
    event.preventDefault();
    
    if (!validateForm('studentForm')) {
        return;
    }
    
    const submitBtn = event.target.querySelector('.btn-register-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Registering...';
    submitBtn.disabled = true;
    
    try {
        const studentData = {
            firstName: document.getElementById('studentFirstName').value.trim(),
            lastName: document.getElementById('studentLastName').value.trim(),
            email: document.getElementById('studentEmail').value.trim(),
            phone: document.getElementById('studentPhone').value.trim(),
            dateOfBirth: document.getElementById('studentDOB').value,
            gender: document.getElementById('studentGender').value,
            class: document.getElementById('studentClass').value,
            rollNumber: document.getElementById('studentRollNumber').value.trim(),
            address: document.getElementById('studentAddress').value.trim(),
            password: document.getElementById('studentPassword').value,
            role: 'student',
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        // Check if Firebase is available
        if (typeof firebase !== 'undefined' && firebase.auth && typeof DatabaseHelper !== 'undefined') {
            try {
                // Use Firebase registration
                const userId = await DatabaseHelper.registerUser(studentData, 'student');
                
                // Save to local storage for demo compatibility
                let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                users.push({
                    id: userId,
                    username: studentData.email,
                    password: studentData.password,
                    role: 'student',
                    fullName: `${studentData.firstName} ${studentData.lastName}`,
                    email: studentData.email,
                    class: studentData.class
                });
                localStorage.setItem('registeredUsers', JSON.stringify(users));
                
            } catch (firebaseError) {
                console.error('Firebase registration failed, using local storage:', firebaseError);
                // Fallback to local storage
                const studentId = 'STU' + Date.now().toString().slice(-6);
                
                let students = JSON.parse(localStorage.getItem('registeredStudents') || '[]');
                students.push({ id: studentId, ...studentData });
                localStorage.setItem('registeredStudents', JSON.stringify(students));
                
                let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                users.push({
                    id: studentId,
                    username: studentData.email,
                    password: studentData.password,
                    role: 'student',
                    fullName: `${studentData.firstName} ${studentData.lastName}`,
                    email: studentData.email,
                    class: studentData.class
                });
                localStorage.setItem('registeredUsers', JSON.stringify(users));
            }
        } else {
            // Use local storage for demo
            const studentId = 'STU' + Date.now().toString().slice(-6);
            
            let students = JSON.parse(localStorage.getItem('registeredStudents') || '[]');
            students.push({ id: studentId, ...studentData });
            localStorage.setItem('registeredStudents', JSON.stringify(students));
            
            let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            users.push({
                id: studentId,
                username: studentData.email,
                password: studentData.password,
                role: 'student',
                fullName: `${studentData.firstName} ${studentData.lastName}`,
                email: studentData.email,
                class: studentData.class
            });
            localStorage.setItem('registeredUsers', JSON.stringify(users));
        }
        
        showMessage('Student registration successful! Your account is pending approval.', 'success');
        
        // Close modal after delay
        setTimeout(() => {
            closeRegistrationModal();
        }, 2000);
        
    } catch (error) {
        console.error('Student registration error:', error);
        showMessage('Registration failed. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Faculty Registration
async function handleFacultyRegistration(event) {
    event.preventDefault();
    
    if (!validateForm('facultyForm')) {
        return;
    }
    
    const submitBtn = event.target.querySelector('.btn-register-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Registering...';
    submitBtn.disabled = true;
    
    try {
        const facultyData = {
            firstName: document.getElementById('facultyFirstName').value.trim(),
            lastName: document.getElementById('facultyLastName').value.trim(),
            email: document.getElementById('facultyEmail').value.trim(),
            phone: document.getElementById('facultyPhone').value.trim(),
            employeeId: document.getElementById('facultyEmployeeId').value.trim(),
            department: document.getElementById('facultyDepartment').value,
            subject: document.getElementById('facultySubject').value.trim(),
            experience: parseInt(document.getElementById('facultyExperience').value),
            address: document.getElementById('facultyAddress').value.trim(),
            password: document.getElementById('facultyPassword').value,
            role: 'faculty',
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        // Check if Firebase is available
        if (typeof firebase !== 'undefined' && firebase.auth && typeof DatabaseHelper !== 'undefined') {
            try {
                // Use Firebase registration
                const userId = await DatabaseHelper.registerUser(facultyData, 'faculty');
                
                // Save to local storage for demo compatibility
                let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                users.push({
                    id: userId,
                    username: facultyData.email,
                    password: facultyData.password,
                    role: 'faculty',
                    fullName: `${facultyData.firstName} ${facultyData.lastName}`,
                    email: facultyData.email,
                    department: facultyData.department
                });
                localStorage.setItem('registeredUsers', JSON.stringify(users));
                
            } catch (firebaseError) {
                console.error('Firebase registration failed, using local storage:', firebaseError);
                // Fallback to local storage
                const facultyId = 'FAC' + Date.now().toString().slice(-6);
                
                let faculty = JSON.parse(localStorage.getItem('registeredFaculty') || '[]');
                faculty.push({ id: facultyId, ...facultyData });
                localStorage.setItem('registeredFaculty', JSON.stringify(faculty));
                
                let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                users.push({
                    id: facultyId,
                    username: facultyData.email,
                    password: facultyData.password,
                    role: 'faculty',
                    fullName: `${facultyData.firstName} ${facultyData.lastName}`,
                    email: facultyData.email,
                    department: facultyData.department
                });
                localStorage.setItem('registeredUsers', JSON.stringify(users));
            }
        } else {
            // Use local storage for demo
            const facultyId = 'FAC' + Date.now().toString().slice(-6);
            
            let faculty = JSON.parse(localStorage.getItem('registeredFaculty') || '[]');
            faculty.push({ id: facultyId, ...facultyData });
            localStorage.setItem('registeredFaculty', JSON.stringify(faculty));
            
            let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            users.push({
                id: facultyId,
                username: facultyData.email,
                password: facultyData.password,
                role: 'faculty',
                fullName: `${facultyData.firstName} ${facultyData.lastName}`,
                email: facultyData.email,
                department: facultyData.department
            });
            localStorage.setItem('registeredUsers', JSON.stringify(users));
        }
        
        showMessage('Faculty registration successful! Your account is pending approval.', 'success');
        
        // Close modal after delay
        setTimeout(() => {
            closeRegistrationModal();
        }, 2000);
        
    } catch (error) {
        console.error('Faculty registration error:', error);
        showMessage('Registration failed. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Parent Registration
async function handleParentRegistration(event) {
    event.preventDefault();
    
    if (!validateForm('parentForm')) {
        return;
    }
    
    const submitBtn = event.target.querySelector('.btn-register-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Registering...';
    submitBtn.disabled = true;
    
    try {
        const parentData = {
            firstName: document.getElementById('parentFirstName').value.trim(),
            lastName: document.getElementById('parentLastName').value.trim(),
            email: document.getElementById('parentEmail').value.trim(),
            phone: document.getElementById('parentPhone').value.trim(),
            studentRollNumber: document.getElementById('parentStudentRoll').value.trim(),
            relationship: document.getElementById('parentRelationship').value,
            address: document.getElementById('parentAddress').value.trim(),
            password: document.getElementById('parentPassword').value,
            role: 'parent',
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        // Check if Firebase is available
        if (typeof firebase !== 'undefined' && firebase.auth && typeof DatabaseHelper !== 'undefined') {
            try {
                // Use Firebase registration
                const userId = await DatabaseHelper.registerUser(parentData, 'parent');
                
                // Save to local storage for demo compatibility
                let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                users.push({
                    id: userId,
                    username: parentData.email,
                    password: parentData.password,
                    role: 'parent',
                    fullName: `${parentData.firstName} ${parentData.lastName}`,
                    email: parentData.email,
                    studentRollNumber: parentData.studentRollNumber
                });
                localStorage.setItem('registeredUsers', JSON.stringify(users));
                
            } catch (firebaseError) {
                console.error('Firebase registration failed, using local storage:', firebaseError);
                // Fallback to local storage
                const parentId = 'PAR' + Date.now().toString().slice(-6);
                
                let parents = JSON.parse(localStorage.getItem('registeredParents') || '[]');
                parents.push({ id: parentId, ...parentData });
                localStorage.setItem('registeredParents', JSON.stringify(parents));
                
                let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                users.push({
                    id: parentId,
                    username: parentData.email,
                    password: parentData.password,
                    role: 'parent',
                    fullName: `${parentData.firstName} ${parentData.lastName}`,
                    email: parentData.email,
                    studentRollNumber: parentData.studentRollNumber
                });
                localStorage.setItem('registeredUsers', JSON.stringify(users));
            }
        } else {
            // Use local storage for demo
            const parentId = 'PAR' + Date.now().toString().slice(-6);
            
            let parents = JSON.parse(localStorage.getItem('registeredParents') || '[]');
            parents.push({ id: parentId, ...parentData });
            localStorage.setItem('registeredParents', JSON.stringify(parents));
            
            let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            users.push({
                id: parentId,
                username: parentData.email,
                password: parentData.password,
                role: 'parent',
                fullName: `${parentData.firstName} ${parentData.lastName}`,
                email: parentData.email,
                studentRollNumber: parentData.studentRollNumber
            });
            localStorage.setItem('registeredUsers', JSON.stringify(users));
        }
        
        showMessage('Parent registration successful! Your account is pending approval.', 'success');
        
        // Close modal after delay
        setTimeout(() => {
            closeRegistrationModal();
        }, 2000);
        
    } catch (error) {
        console.error('Parent registration error:', error);
        showMessage('Registration failed. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Animation Functions
function addScrollAnimations() {
    const animateElements = document.querySelectorAll('.feature-card, .access-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });
    
    animateElements.forEach(element => {
        observer.observe(element);
    });
}

// Dashboard Navigation Functions
function navigateToSection(section) {
    // This will be used in dashboard pages
    console.log(`Navigating to: ${section}`);
}

// Common Dashboard Functions (will be used across all dashboards)
const DashboardUtils = {
    // Generate dynamic charts
    createChart: function(elementId, type, data, options = {}) {
        // Placeholder for chart creation
        console.log(`Creating ${type} chart in ${elementId}`, data);
    },
    
    // Format currency
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    },
    
    // Format date
    formatDate: function(date) {
        return new Intl.DateTimeFormat('en-IN').format(new Date(date));
    },
    
    // Show notifications
    showNotification: function(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    },
    
    // Generate QR Code (placeholder)
    generateQR: function(data, elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<div class="qr-placeholder">QR Code for: ${data}</div>`;
        }
    },
    
    // Export data to CSV
    exportToCSV: function(data, filename) {
        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    },
    
    convertToCSV: function(data) {
        if (!data || !data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        const csvRows = data.map(row => 
            headers.map(header => `"${row[header] || ''}"`).join(',')
        );
        
        return [csvHeaders, ...csvRows].join('\n');
    }
};

// Firebase Integration Helpers
const FirebaseUtils = {
    // Initialize Firebase (to be called from firebase-config.js)
    init: function(config) {
        // Firebase initialization will happen in firebase-config.js
        console.log('Firebase initialized');
    },
    
    // Authentication helpers
    signIn: async function(email, password) {
        try {
            // Firebase auth sign in
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            return userCredential.user;
        } catch (error) {
            throw error;
        }
    },
    
    signOut: async function() {
        try {
            await firebase.auth().signOut();
            currentUser = null;
            localStorage.removeItem('currentUser');
        } catch (error) {
            throw error;
        }
    },
    
    // Firestore helpers
    addDocument: async function(collection, data) {
        try {
            const docRef = await firebase.firestore().collection(collection).add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            throw error;
        }
    },
    
    getDocument: async function(collection, id) {
        try {
            const doc = await firebase.firestore().collection(collection).doc(id).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            throw error;
        }
    },
    
    updateDocument: async function(collection, id, data) {
        try {
            await firebase.firestore().collection(collection).doc(id).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            throw error;
        }
    },
    
    deleteDocument: async function(collection, id) {
        try {
            await firebase.firestore().collection(collection).doc(id).delete();
        } catch (error) {
            throw error;
        }
    },
    
    getCollection: async function(collection, orderBy = 'createdAt', limit = null) {
        try {
            let query = firebase.firestore().collection(collection).orderBy(orderBy, 'desc');
            if (limit) query = query.limit(limit);
            
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw error;
        }
    }
};

// Make functions globally available
window.showLoginModal = showLoginModal;
window.closeLoginModal = closeLoginModal;
window.showDemo = showDemo;
window.showForgotPassword = showForgotPassword;
window.showRegistration = showRegistration;
window.quickLogin = quickLogin;
window.logout = logout;
window.DashboardUtils = DashboardUtils;
window.FirebaseUtils = FirebaseUtils;