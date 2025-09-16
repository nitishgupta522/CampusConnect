// Firebase Configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBpCEVCLhJGIXTlaBQ7sMozmXR0e1_l94g",
    authDomain: "edumanage-9f1eb.firebaseapp.com",
    projectId: "edumanage-9f1eb",
    storageBucket: "edumanage-9f1eb.firebasestorage.app",
    messagingSenderId: "317160234464",
    appId: "1:317160234464:web:97e08068a76aa033a69f85",
    measurementId: "G-00X2WS3LQ0"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Authentication state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User signed in:', user.email);
        currentUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
        };
    } else {
        console.log('User signed out');
        currentUser = null;
    }
});

// Database Collections Structure
const COLLECTIONS = {
    USERS: 'users',
    STUDENTS: 'students',
    FACULTY: 'faculty',
    PARENTS: 'parents',
    COURSES: 'courses',
    SUBJECTS: 'subjects',
    ATTENDANCE: 'attendance',
    FEES: 'fees',
    RESULTS: 'results',
    ANNOUNCEMENTS: 'announcements',
    ASSIGNMENTS: 'assignments',
    ASSIGNMENT_SUBMISSIONS: 'assignment_submissions',
    MESSAGES: 'messages',
    NOTIFICATIONS: 'notifications',
    LIBRARY: 'library',
    HOSTEL: 'hostel',
    TRANSPORT: 'transport',
    TIMETABLE: 'timetable',
    EVENTS: 'events'
};

// Sample Data for Development
const SAMPLE_DATA = {
    students: [
        {
            id: 'STU001',
            name: 'Rahul Sharma',
            email: 'rahul@student.school.edu',
            rollNumber: '2024001',
            class: '12',
            section: 'A',
            dateOfBirth: '2006-05-15',
            phoneNumber: '+91-9876543210',
            address: 'Lucknow, UP',
            parentId: 'PAR001',
            admissionDate: '2022-04-01',
            fees: {
                total: 50000,
                paid: 30000,
                pending: 20000
            },
            attendance: {
                present: 180,
                total: 200,
                percentage: 90
            }
        },
        {
            id: 'STU002',
            name: 'Priya Gupta',
            email: 'priya@student.school.edu',
            rollNumber: '2024002',
            class: '11',
            section: 'B',
            dateOfBirth: '2007-08-22',
            phoneNumber: '+91-9876543211',
            address: 'Kanpur, UP',
            parentId: 'PAR002',
            admissionDate: '2023-04-01',
            fees: {
                total: 48000,
                paid: 48000,
                pending: 0
            },
            attendance: {
                present: 195,
                total: 200,
                percentage: 97.5
            }
        }
    ],
    
    faculty: [
        {
            id: 'FAC001',
            name: 'Dr. Amit Kumar',
            email: 'amit@faculty.school.edu',
            employeeId: 'EMP001',
            department: 'Mathematics',
            subjects: ['Mathematics', 'Statistics'],
            qualification: 'PhD in Mathematics',
            experience: 10,
            phoneNumber: '+91-9876543220',
            joiningDate: '2020-06-01',
            classes: ['12A', '11B', '10C']
        },
        {
            id: 'FAC002',
            name: 'Mrs. Sunita Singh',
            email: 'sunita@faculty.school.edu',
            employeeId: 'EMP002',
            department: 'Physics',
            subjects: ['Physics', 'Science'],
            qualification: 'M.Sc. Physics',
            experience: 8,
            phoneNumber: '+91-9876543221',
            joiningDate: '2021-04-01',
            classes: ['12A', '11A']
        }
    ],
    
    parents: [
        {
            id: 'PAR001',
            name: 'Mr. Rajesh Sharma',
            email: 'rajesh@parent.school.edu',
            phoneNumber: '+91-9876543230',
            occupation: 'Business',
            studentIds: ['STU001'],
            address: 'Lucknow, UP'
        },
        {
            id: 'PAR002',
            name: 'Mrs. Meera Gupta',
            email: 'meera@parent.school.edu',
            phoneNumber: '+91-9876543231',
            occupation: 'Teacher',
            studentIds: ['STU002'],
            address: 'Kanpur, UP'
        }
    ],
    
    courses: [
        {
            id: 'COU001',
            name: 'Science Stream',
            class: '12',
            subjects: ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science'],
            credits: 100,
            duration: '2 years'
        },
        {
            id: 'COU002',
            name: 'Commerce Stream',
            class: '12',
            subjects: ['Accountancy', 'Business Studies', 'Economics', 'English', 'Mathematics'],
            credits: 100,
            duration: '2 years'
        }
    ],
    
    announcements: [
        {
            id: 'ANN001',
            title: 'Annual Function 2025',
            content: 'The annual function will be held on March 15, 2025. All students are requested to participate.',
            date: '2025-02-01',
            type: 'event',
            priority: 'high',
            targetAudience: ['students', 'parents', 'faculty']
        },
        {
            id: 'ANN002',
            title: 'Exam Schedule Released',
            content: 'The final examination schedule has been released. Please check your respective class sections.',
            date: '2025-01-15',
            type: 'academic',
            priority: 'urgent',
            targetAudience: ['students', 'parents']
        }
    ]
};

// Database helper functions
const DatabaseHelper = {
    // Initialize sample data
    async initializeSampleData() {
        try {
            for (const [collection, data] of Object.entries(SAMPLE_DATA)) {
                for (const item of data) {
                    await db.collection(collection).doc(item.id).set({
                        ...item,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            }
            console.log('Sample data initialized successfully');
        } catch (error) {
            console.error('Error initializing sample data:', error);
        }
    },
    
    // Student operations
    async addStudent(studentData) {
        try {
            const docRef = await db.collection(COLLECTIONS.STUDENTS).add({
                ...studentData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            throw new Error('Failed to add student: ' + error.message);
        }
    },

    // Registration operations
    async registerUser(userData, role) {
        try {
            // Create user account with Firebase Auth
            const userCredential = await auth.createUserWithEmailAndPassword(
                userData.email, 
                userData.password
            );
            
            const userId = userCredential.user.uid;
            
            // Save user data to appropriate collection
            const collectionName = role === 'student' ? COLLECTIONS.STUDENTS : 
                                 role === 'faculty' ? COLLECTIONS.FACULTY : 
                                 COLLECTIONS.PARENTS;
            
            const docRef = await db.collection(collectionName).doc(userId).set({
                ...userData,
                uid: userId,
                role: role,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return userId;
        } catch (error) {
            throw error;
        }
    },

    async checkEmailExists(email) {
        try {
            const students = await db.collection(COLLECTIONS.STUDENTS)
                .where('email', '==', email).get();
            const faculty = await db.collection(COLLECTIONS.FACULTY)
                .where('email', '==', email).get();
            const parents = await db.collection(COLLECTIONS.PARENTS)
                .where('email', '==', email).get();
            
            return !students.empty || !faculty.empty || !parents.empty;
        } catch (error) {
            throw error;
        }
    },
    
    async getStudent(studentId) {
        try {
            const doc = await db.collection(COLLECTIONS.STUDENTS).doc(studentId).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            throw new Error('Failed to get student: ' + error.message);
        }
    },
    
    async getAllStudents() {
        try {
            const snapshot = await db.collection(COLLECTIONS.STUDENTS).orderBy('name').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error('Failed to get students: ' + error.message);
        }
    },
    
    // Attendance operations
    async markAttendance(attendanceData) {
        try {
            const docRef = await db.collection(COLLECTIONS.ATTENDANCE).add({
                ...attendanceData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            throw new Error('Failed to mark attendance: ' + error.message);
        }
    },
    
    async getAttendance(studentId, dateRange) {
        try {
            let query = db.collection(COLLECTIONS.ATTENDANCE)
                .where('studentId', '==', studentId);
                
            if (dateRange && dateRange.start && dateRange.end) {
                query = query.where('date', '>=', dateRange.start)
                           .where('date', '<=', dateRange.end);
            }
            
            const snapshot = await query.orderBy('date', 'desc').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error('Failed to get attendance: ' + error.message);
        }
    },
    
    // Fee operations
    async addFeeRecord(feeData) {
        try {
            const docRef = await db.collection(COLLECTIONS.FEES).add({
                ...feeData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            throw new Error('Failed to add fee record: ' + error.message);
        }
    },
    
    async getFeeStatus(studentId) {
        try {
            const snapshot = await db.collection(COLLECTIONS.FEES)
                .where('studentId', '==', studentId)
                .orderBy('createdAt', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error('Failed to get fee status: ' + error.message);
        }
    },
    
    // Result operations
    async addResult(resultData) {
        try {
            const docRef = await db.collection(COLLECTIONS.RESULTS).add({
                ...resultData,
                publishedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            throw new Error('Failed to add result: ' + error.message);
        }
    },
    
    async getResults(studentId, examType) {
        try {
            let query = db.collection(COLLECTIONS.RESULTS)
                .where('studentId', '==', studentId);
                
            if (examType) {
                query = query.where('examType', '==', examType);
            }
            
            const snapshot = await query.orderBy('publishedAt', 'desc').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error('Failed to get results: ' + error.message);
        }
    },
    
    // Announcement operations
    async addAnnouncement(announcementData) {
        try {
            const docRef = await db.collection(COLLECTIONS.ANNOUNCEMENTS).add({
                ...announcementData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            throw new Error('Failed to add announcement: ' + error.message);
        }
    },
    
    async getAnnouncements(targetAudience) {
        try {
            let query = db.collection(COLLECTIONS.ANNOUNCEMENTS);
            
            if (targetAudience) {
                query = query.where('targetAudience', 'array-contains', targetAudience);
            }
            
            const snapshot = await query.orderBy('createdAt', 'desc').limit(10).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error('Failed to get announcements: ' + error.message);
        }
    },

    // Assignment operations
    async createAssignment(assignmentData) {
        try {
            const docRef = await db.collection(COLLECTIONS.ASSIGNMENTS).add({
                ...assignmentData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            throw new Error('Failed to create assignment: ' + error.message);
        }
    },

    async getAssignments(filters = {}) {
        try {
            let query = db.collection(COLLECTIONS.ASSIGNMENTS);
            
            if (filters.class) {
                query = query.where('class', '==', filters.class);
            }
            if (filters.subject) {
                query = query.where('subject', '==', filters.subject);
            }
            if (filters.facultyId) {
                query = query.where('facultyId', '==', filters.facultyId);
            }
            if (filters.status) {
                query = query.where('status', '==', filters.status);
            }
            
            const snapshot = await query.orderBy('createdAt', 'desc').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error('Failed to get assignments: ' + error.message);
        }
    },

    async getAssignmentById(assignmentId) {
        try {
            const doc = await db.collection(COLLECTIONS.ASSIGNMENTS).doc(assignmentId).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            throw new Error('Failed to get assignment: ' + error.message);
        }
    },

    async updateAssignment(assignmentId, updateData) {
        try {
            await db.collection(COLLECTIONS.ASSIGNMENTS).doc(assignmentId).update({
                ...updateData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            throw new Error('Failed to update assignment: ' + error.message);
        }
    },

    async deleteAssignment(assignmentId) {
        try {
            await db.collection(COLLECTIONS.ASSIGNMENTS).doc(assignmentId).delete();
        } catch (error) {
            throw new Error('Failed to delete assignment: ' + error.message);
        }
    },

    // Assignment submission operations
    async submitAssignment(submissionData) {
        try {
            const docRef = await db.collection(COLLECTIONS.ASSIGNMENT_SUBMISSIONS).add({
                ...submissionData,
                submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'submitted'
            });
            return docRef.id;
        } catch (error) {
            throw new Error('Failed to submit assignment: ' + error.message);
        }
    },

    async getAssignmentSubmissions(assignmentId) {
        try {
            const snapshot = await db.collection(COLLECTIONS.ASSIGNMENT_SUBMISSIONS)
                .where('assignmentId', '==', assignmentId)
                .orderBy('submittedAt', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error('Failed to get assignment submissions: ' + error.message);
        }
    },

    async getStudentSubmissions(studentId) {
        try {
            const snapshot = await db.collection(COLLECTIONS.ASSIGNMENT_SUBMISSIONS)
                .where('studentId', '==', studentId)
                .orderBy('submittedAt', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error('Failed to get student submissions: ' + error.message);
        }
    },

    async gradeAssignment(submissionId, gradeData) {
        try {
            await db.collection(COLLECTIONS.ASSIGNMENT_SUBMISSIONS).doc(submissionId).update({
                ...gradeData,
                gradedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'graded'
            });
        } catch (error) {
            throw new Error('Failed to grade assignment: ' + error.message);
        }
    },

    // Message operations
    async sendMessage(messageData) {
        try {
            const docRef = await db.collection(COLLECTIONS.MESSAGES).add({
                ...messageData,
                sentAt: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            });
            return docRef.id;
        } catch (error) {
            throw new Error('Failed to send message: ' + error.message);
        }
    },

    async getMessages(recipientId, recipientType) {
        try {
            const snapshot = await db.collection(COLLECTIONS.MESSAGES)
                .where('recipientId', '==', recipientId)
                .where('recipientType', '==', recipientType)
                .orderBy('sentAt', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error('Failed to get messages: ' + error.message);
        }
    },

    // Notification operations
    async createNotification(notificationData) {
        try {
            const docRef = await db.collection(COLLECTIONS.NOTIFICATIONS).add({
                ...notificationData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            });
            return docRef.id;
        } catch (error) {
            throw new Error('Failed to create notification: ' + error.message);
        }
    },

    async getNotifications(recipientId, recipientType) {
        try {
            const snapshot = await db.collection(COLLECTIONS.NOTIFICATIONS)
                .where('recipientId', '==', recipientId)
                .where('recipientType', '==', recipientType)
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error('Failed to get notifications: ' + error.message);
        }
    },

    async markNotificationAsRead(notificationId) {
        try {
            await db.collection(COLLECTIONS.NOTIFICATIONS).doc(notificationId).update({
                read: true,
                readAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            throw new Error('Failed to mark notification as read: ' + error.message);
        }
    }
};

// File Storage Helper Functions
const FileStorageHelper = {
    // Upload file to Firebase Storage
    async uploadFile(file, path) {
        try {
            const storageRef = storage.ref();
            const fileRef = storageRef.child(path);
            const snapshot = await fileRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();
            return {
                url: downloadURL,
                path: path,
                name: file.name,
                size: file.size,
                type: file.type
            };
        } catch (error) {
            throw new Error('Failed to upload file: ' + error.message);
        }
    },

    // Delete file from Firebase Storage
    async deleteFile(path) {
        try {
            const fileRef = storage.ref().child(path);
            await fileRef.delete();
        } catch (error) {
            throw new Error('Failed to delete file: ' + error.message);
        }
    },

    // Get file download URL
    async getDownloadURL(path) {
        try {
            const fileRef = storage.ref().child(path);
            return await fileRef.getDownloadURL();
        } catch (error) {
            throw new Error('Failed to get download URL: ' + error.message);
        }
    },

    // Generate unique file path
    generateFilePath(type, originalName, userId) {
        const timestamp = Date.now();
        const extension = originalName.split('.').pop();
        const fileName = `${timestamp}_${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        return `${type}/${userId}/${fileName}`;
    }
};

// Real-time listeners
const RealtimeListeners = {
    // Listen to attendance updates
    listenToAttendance(callback) {
        return db.collection(COLLECTIONS.ATTENDANCE)
            .orderBy('timestamp', 'desc')
            .limit(50)
            .onSnapshot(callback);
    },
    
    // Listen to announcements
    listenToAnnouncements(callback) {
        return db.collection(COLLECTIONS.ANNOUNCEMENTS)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .onSnapshot(callback);
    },
    
    // Listen to fee updates
    listenToFeeUpdates(studentId, callback) {
        return db.collection(COLLECTIONS.FEES)
            .where('studentId', '==', studentId)
            .orderBy('createdAt', 'desc')
            .onSnapshot(callback);
    },

    // Listen to assignments
    listenToAssignments(filters, callback) {
        let query = db.collection(COLLECTIONS.ASSIGNMENTS);
        
        if (filters.class) {
            query = query.where('class', '==', filters.class);
        }
        if (filters.subject) {
            query = query.where('subject', '==', filters.subject);
        }
        if (filters.facultyId) {
            query = query.where('facultyId', '==', filters.facultyId);
        }
        
        return query.orderBy('createdAt', 'desc').onSnapshot(callback);
    },

    // Listen to assignment submissions
    listenToAssignmentSubmissions(assignmentId, callback) {
        return db.collection(COLLECTIONS.ASSIGNMENT_SUBMISSIONS)
            .where('assignmentId', '==', assignmentId)
            .orderBy('submittedAt', 'desc')
            .onSnapshot(callback);
    },

    // Listen to messages
    listenToMessages(recipientId, recipientType, callback) {
        return db.collection(COLLECTIONS.MESSAGES)
            .where('recipientId', '==', recipientId)
            .where('recipientType', '==', recipientType)
            .orderBy('sentAt', 'desc')
            .limit(20)
            .onSnapshot(callback);
    },

    // Listen to notifications
    listenToNotifications(recipientId, recipientType, callback) {
        return db.collection(COLLECTIONS.NOTIFICATIONS)
            .where('recipientId', '==', recipientId)
            .where('recipientType', '==', recipientType)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .onSnapshot(callback);
    }
};

// Export for use in other files
window.db = db;
window.auth = auth;
window.storage = storage;
window.COLLECTIONS = COLLECTIONS;
window.SAMPLE_DATA = SAMPLE_DATA;
window.DatabaseHelper = DatabaseHelper;
window.FileStorageHelper = FileStorageHelper;
window.RealtimeListeners = RealtimeListeners;

// Initialize sample data on first load (comment out in production)
// DatabaseHelper.initializeSampleData();