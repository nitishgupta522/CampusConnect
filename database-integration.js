// Database Integration Module
// Handles all database operations with Firebase and localStorage fallback

class DatabaseIntegration {
    constructor() {
        this.isFirebaseAvailable = false;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Check if Firebase is available
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                this.isFirebaseAvailable = true;
                console.log('Firebase is available');
            } else {
                console.log('Firebase not available, using localStorage fallback');
            }
            
            this.isInitialized = true;
            await this.initializeSampleData();
        } catch (error) {
            console.error('Database initialization error:', error);
            this.isInitialized = true;
        }
    }

    // Initialize sample data for demo purposes
    async initializeSampleData() {
        try {
            // Check if sample data already exists
            const hasSampleData = localStorage.getItem('hasSampleData');
            if (hasSampleData) return;

            // Create sample students
            const sampleStudents = [
                {
                    id: 'STU001',
                    name: 'Aarav Patel',
                    email: 'aarav@student.school.edu',
                    rollNumber: '2024001',
                    class: '12',
                    section: 'A',
                    phoneNumber: '+91-9876543210',
                    address: 'Mumbai, Maharashtra',
                    status: 'active',
                    admissionDate: '2022-04-01',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'STU002',
                    name: 'Meera Singh',
                    email: 'meera@student.school.edu',
                    rollNumber: '2024002',
                    class: '11',
                    section: 'B',
                    phoneNumber: '+91-9876543211',
                    address: 'Delhi, Delhi',
                    status: 'active',
                    admissionDate: '2023-04-01',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'STU003',
                    name: 'Rohan Kumar',
                    email: 'rohan@student.school.edu',
                    rollNumber: '2024003',
                    class: '10',
                    section: 'C',
                    phoneNumber: '+91-9876543212',
                    address: 'Bangalore, Karnataka',
                    status: 'active',
                    admissionDate: '2024-04-01',
                    createdAt: new Date().toISOString()
                }
            ];

            // Create sample faculty
            const sampleFaculty = [
                {
                    id: 'FAC001',
                    name: 'Dr. Amit Kumar',
                    email: 'amit@faculty.school.edu',
                    employeeId: 'EMP001',
                    department: 'Mathematics',
                    subject: 'Mathematics',
                    experience: 10,
                    phoneNumber: '+91-9876543220',
                    address: 'Mumbai, Maharashtra',
                    status: 'active',
                    joiningDate: '2020-06-01',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'FAC002',
                    name: 'Mrs. Sunita Singh',
                    email: 'sunita@faculty.school.edu',
                    employeeId: 'EMP002',
                    department: 'Physics',
                    subject: 'Physics',
                    experience: 8,
                    phoneNumber: '+91-9876543221',
                    address: 'Delhi, Delhi',
                    status: 'active',
                    joiningDate: '2021-04-01',
                    createdAt: new Date().toISOString()
                }
            ];

            // Create sample attendance records
            const sampleAttendance = [
                {
                    id: 'ATT001',
                    studentId: 'STU001',
                    studentName: 'Aarav Patel',
                    rollNumber: '2024001',
                    class: '12',
                    section: 'A',
                    status: 'present',
                    date: new Date().toISOString().split('T')[0],
                    timestamp: new Date().toISOString(),
                    markedBy: 'admin'
                },
                {
                    id: 'ATT002',
                    studentId: 'STU002',
                    studentName: 'Meera Singh',
                    rollNumber: '2024002',
                    class: '11',
                    section: 'B',
                    status: 'present',
                    date: new Date().toISOString().split('T')[0],
                    timestamp: new Date().toISOString(),
                    markedBy: 'admin'
                }
            ];

            // Create sample fee records
            const sampleFees = [
                {
                    id: 'FEE001',
                    studentId: 'STU001',
                    studentName: 'Aarav Patel',
                    class: '12',
                    feeType: 'tuition',
                    amount: 50000,
                    status: 'pending',
                    dueDate: '2025-03-15',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'FEE002',
                    studentId: 'STU002',
                    studentName: 'Meera Singh',
                    class: '11',
                    feeType: 'tuition',
                    amount: 48000,
                    status: 'paid',
                    dueDate: '2025-02-15',
                    createdAt: new Date().toISOString()
                }
            ];

            // Save to localStorage
            localStorage.setItem('sampleStudents', JSON.stringify(sampleStudents));
            localStorage.setItem('sampleFaculty', JSON.stringify(sampleFaculty));
            localStorage.setItem('sampleAttendance', JSON.stringify(sampleAttendance));
            localStorage.setItem('sampleFees', JSON.stringify(sampleFees));
            localStorage.setItem('hasSampleData', 'true');

            console.log('Sample data initialized successfully');

        } catch (error) {
            console.error('Error initializing sample data:', error);
        }
    }

    // Student operations
    async addStudent(studentData) {
        try {
            if (this.isFirebaseAvailable) {
                const docRef = await db.collection('students').add({
                    ...studentData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                return docRef.id;
            } else {
                // Fallback to localStorage
                const studentId = 'STU' + Date.now().toString().slice(-6);
                const newStudent = { id: studentId, ...studentData };
                
                let students = JSON.parse(localStorage.getItem('registeredStudents') || '[]');
                students.push(newStudent);
                localStorage.setItem('registeredStudents', JSON.stringify(students));
                
                return studentId;
            }
        } catch (error) {
            throw new Error('Failed to add student: ' + error.message);
        }
    }

    async getAllStudents() {
        try {
            if (this.isFirebaseAvailable) {
                const snapshot = await db.collection('students').orderBy('name').get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else {
                // Fallback to localStorage
                const registeredStudents = JSON.parse(localStorage.getItem('registeredStudents') || '[]');
                const sampleStudents = JSON.parse(localStorage.getItem('sampleStudents') || '[]');
                return [...registeredStudents, ...sampleStudents];
            }
        } catch (error) {
            throw new Error('Failed to get students: ' + error.message);
        }
    }

    // Faculty operations
    async addFaculty(facultyData) {
        try {
            if (this.isFirebaseAvailable) {
                const docRef = await db.collection('faculty').add({
                    ...facultyData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                return docRef.id;
            } else {
                // Fallback to localStorage
                const facultyId = 'FAC' + Date.now().toString().slice(-6);
                const newFaculty = { id: facultyId, ...facultyData };
                
                let faculty = JSON.parse(localStorage.getItem('registeredFaculty') || '[]');
                faculty.push(newFaculty);
                localStorage.setItem('registeredFaculty', JSON.stringify(faculty));
                
                return facultyId;
            }
        } catch (error) {
            throw new Error('Failed to add faculty: ' + error.message);
        }
    }

    async getAllFaculty() {
        try {
            if (this.isFirebaseAvailable) {
                const snapshot = await db.collection('faculty').orderBy('name').get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else {
                // Fallback to localStorage
                const registeredFaculty = JSON.parse(localStorage.getItem('registeredFaculty') || '[]');
                const sampleFaculty = JSON.parse(localStorage.getItem('sampleFaculty') || '[]');
                return [...registeredFaculty, ...sampleFaculty];
            }
        } catch (error) {
            throw new Error('Failed to get faculty: ' + error.message);
        }
    }

    // Attendance operations
    async markAttendance(attendanceData) {
        try {
            if (this.isFirebaseAvailable) {
                const docRef = await db.collection('attendance').add({
                    ...attendanceData,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                return docRef.id;
            } else {
                // Fallback to localStorage
                const attendanceId = 'ATT' + Date.now().toString().slice(-6);
                const newAttendance = { id: attendanceId, ...attendanceData };
                
                // Save to student-specific attendance
                const studentAttendance = JSON.parse(localStorage.getItem(`attendance_${attendanceData.studentId}`) || '[]');
                studentAttendance.push(newAttendance);
                localStorage.setItem(`attendance_${attendanceData.studentId}`, JSON.stringify(studentAttendance));
                
                // Also save to global attendance
                let allAttendance = JSON.parse(localStorage.getItem('sampleAttendance') || '[]');
                allAttendance.push(newAttendance);
                localStorage.setItem('sampleAttendance', JSON.stringify(allAttendance));
                
                return attendanceId;
            }
        } catch (error) {
            throw new Error('Failed to mark attendance: ' + error.message);
        }
    }

    async getAttendance(studentId, dateRange) {
        try {
            if (this.isFirebaseAvailable) {
                let query = db.collection('attendance').where('studentId', '==', studentId);
                
                if (dateRange && dateRange.start && dateRange.end) {
                    query = query.where('date', '>=', dateRange.start)
                               .where('date', '<=', dateRange.end);
                }
                
                const snapshot = await query.orderBy('date', 'desc').get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else {
                // Fallback to localStorage
                return JSON.parse(localStorage.getItem(`attendance_${studentId}`) || '[]');
            }
        } catch (error) {
            throw new Error('Failed to get attendance: ' + error.message);
        }
    }

    // Fee operations
    async addFeeRecord(feeData) {
        try {
            if (this.isFirebaseAvailable) {
                const docRef = await db.collection('fees').add({
                    ...feeData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                return docRef.id;
            } else {
                // Fallback to localStorage
                const feeId = 'FEE' + Date.now().toString().slice(-6);
                const newFee = { id: feeId, ...feeData };
                
                let fees = JSON.parse(localStorage.getItem('feeData') || '[]');
                fees.push(newFee);
                localStorage.setItem('feeData', JSON.stringify(fees));
                
                return feeId;
            }
        } catch (error) {
            throw new Error('Failed to add fee record: ' + error.message);
        }
    }

    async getAllFees() {
        try {
            if (this.isFirebaseAvailable) {
                const snapshot = await db.collection('fees').orderBy('createdAt', 'desc').get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else {
                // Fallback to localStorage
                const registeredFees = JSON.parse(localStorage.getItem('feeData') || '[]');
                const sampleFees = JSON.parse(localStorage.getItem('sampleFees') || '[]');
                return [...registeredFees, ...sampleFees];
            }
        } catch (error) {
            throw new Error('Failed to get fees: ' + error.message);
        }
    }

    // User registration
    async registerUser(userData, role) {
        try {
            if (this.isFirebaseAvailable) {
                // Create user account with Firebase Auth
                const userCredential = await auth.createUserWithEmailAndPassword(
                    userData.email, 
                    userData.password
                );
                
                const userId = userCredential.user.uid;
                
                // Save user data to appropriate collection
                const collectionName = role === 'student' ? 'students' : 
                                     role === 'faculty' ? 'faculty' : 
                                     'parents';
                
                await db.collection(collectionName).doc(userId).set({
                    ...userData,
                    uid: userId,
                    role: role,
                    status: 'pending',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                return userId;
            } else {
                // Fallback to localStorage
                const userId = role.toUpperCase() + Date.now().toString().slice(-6);
                const newUser = { id: userId, ...userData, role, status: 'pending' };
                
                const storageKey = `registered${role.charAt(0).toUpperCase() + role.slice(1)}`;
                let users = JSON.parse(localStorage.getItem(storageKey) || '[]');
                users.push(newUser);
                localStorage.setItem(storageKey, JSON.stringify(users));
                
                return userId;
            }
        } catch (error) {
            throw error;
        }
    }

    // Check if email exists
    async checkEmailExists(email) {
        try {
            if (this.isFirebaseAvailable) {
                const students = await db.collection('students').where('email', '==', email).get();
                const faculty = await db.collection('faculty').where('email', '==', email).get();
                const parents = await db.collection('parents').where('email', '==', email).get();
                
                return !students.empty || !faculty.empty || !parents.empty;
            } else {
                // Fallback to localStorage
                const allUsers = [
                    ...JSON.parse(localStorage.getItem('registeredStudents') || '[]'),
                    ...JSON.parse(localStorage.getItem('registeredFaculty') || '[]'),
                    ...JSON.parse(localStorage.getItem('registeredParents') || '[]'),
                    ...JSON.parse(localStorage.getItem('sampleStudents') || '[]'),
                    ...JSON.parse(localStorage.getItem('sampleFaculty') || '[]')
                ];
                
                return allUsers.some(user => user.email === email);
            }
        } catch (error) {
            throw error;
        }
    }

    // Real-time listeners
    setupRealtimeListeners() {
        if (!this.isFirebaseAvailable) return;

        try {
            // Listen to students collection
            db.collection('students').onSnapshot((snapshot) => {
                const changes = snapshot.docChanges();
                changes.forEach(change => {
                    if (change.type === 'added' || change.type === 'modified') {
                        const data = { id: change.doc.id, ...change.doc.data() };
                        // Emit event for other modules
                        if (window.ModuleEventBus) {
                            window.ModuleEventBus.emit('studentUpdated', data);
                        }
                    }
                });
            });

            // Listen to faculty collection
            db.collection('faculty').onSnapshot((snapshot) => {
                const changes = snapshot.docChanges();
                changes.forEach(change => {
                    if (change.type === 'added' || change.type === 'modified') {
                        const data = { id: change.doc.id, ...change.doc.data() };
                        // Emit event for other modules
                        if (window.ModuleEventBus) {
                            window.ModuleEventBus.emit('facultyUpdated', data);
                        }
                    }
                });
            });

            // Listen to attendance collection
            db.collection('attendance').onSnapshot((snapshot) => {
                const changes = snapshot.docChanges();
                changes.forEach(change => {
                    if (change.type === 'added' || change.type === 'modified') {
                        const data = { id: change.doc.id, ...change.doc.data() };
                        // Emit event for other modules
                        if (window.ModuleEventBus) {
                            window.ModuleEventBus.emit('attendanceUpdated', data);
                        }
                    }
                });
            });

        } catch (error) {
            console.error('Error setting up real-time listeners:', error);
        }
    }

    // Export data
    exportData(type) {
        try {
            let data = [];
            let filename = '';

            switch (type) {
                case 'students':
                    data = JSON.parse(localStorage.getItem('registeredStudents') || '[]')
                        .concat(JSON.parse(localStorage.getItem('sampleStudents') || '[]'));
                    filename = 'students_export.json';
                    break;
                case 'faculty':
                    data = JSON.parse(localStorage.getItem('registeredFaculty') || '[]')
                        .concat(JSON.parse(localStorage.getItem('sampleFaculty') || '[]'));
                    filename = 'faculty_export.json';
                    break;
                case 'attendance':
                    data = JSON.parse(localStorage.getItem('sampleAttendance') || '[]');
                    filename = 'attendance_export.json';
                    break;
                case 'fees':
                    data = JSON.parse(localStorage.getItem('feeData') || '[]')
                        .concat(JSON.parse(localStorage.getItem('sampleFees') || '[]'));
                    filename = 'fees_export.json';
                    break;
            }

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Error exporting data. Please try again.');
        }
    }

    // Import data
    async importData(file, type) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);

            switch (type) {
                case 'students':
                    localStorage.setItem('registeredStudents', JSON.stringify(data));
                    break;
                case 'faculty':
                    localStorage.setItem('registeredFaculty', JSON.stringify(data));
                    break;
                case 'attendance':
                    localStorage.setItem('sampleAttendance', JSON.stringify(data));
                    break;
                case 'fees':
                    localStorage.setItem('feeData', JSON.stringify(data));
                    break;
            }

            alert(`${type} data imported successfully!`);
            return true;

        } catch (error) {
            console.error('Error importing data:', error);
            alert('Error importing data. Please check the file format.');
            return false;
        }
    }

    // Clear all data
    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            const keys = [
                'registeredStudents', 'registeredFaculty', 'registeredParents',
                'sampleStudents', 'sampleFaculty', 'sampleAttendance', 'sampleFees',
                'feeData', 'hasSampleData'
            ];

            keys.forEach(key => localStorage.removeItem(key));
            alert('All data cleared successfully!');
        }
    }
}

// Initialize database integration
window.databaseIntegration = new DatabaseIntegration();

// Make it globally available
window.DatabaseHelper = {
    addStudent: (data) => window.databaseIntegration.addStudent(data),
    getAllStudents: () => window.databaseIntegration.getAllStudents(),
    addFaculty: (data) => window.databaseIntegration.addFaculty(data),
    getAllFaculty: () => window.databaseIntegration.getAllFaculty(),
    markAttendance: (data) => window.databaseIntegration.markAttendance(data),
    getAttendance: (studentId, dateRange) => window.databaseIntegration.getAttendance(studentId, dateRange),
    addFeeRecord: (data) => window.databaseIntegration.addFeeRecord(data),
    getAllFees: () => window.databaseIntegration.getAllFees(),
    registerUser: (data, role) => window.databaseIntegration.registerUser(data, role),
    checkEmailExists: (email) => window.databaseIntegration.checkEmailExists(email)
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseIntegration;
}
