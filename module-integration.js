// Module Integration System
// This file connects all modules of the school management system

// Global Module Registry
const SchoolModules = {
    student: null,
    faculty: null,
    admin: null,
    parent: null,
    attendance: null,
    fees: null,
    results: null,
    timetable: null,
    communication: null,
    library: null,
    hostel: null,
    transport: null
};

// Global Data Store
const GlobalDataStore = {
    students: [],
    faculty: [],
    parents: [],
    courses: [],
    attendance: [],
    fees: [],
    results: [],
    announcements: [],
    timetable: [],
    users: []
};

// Event System for Module Communication
class ModuleEventBus {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
    
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}

const moduleEventBus = new ModuleEventBus();

// Module Integration Functions
const ModuleIntegration = {
    
    // Initialize all modules
    init() {
        this.setupEventListeners();
        this.loadGlobalData();
        this.registerModules();
        this.establishConnections();
        console.log('All modules integrated successfully');
    },
    
    // Register individual modules
    registerModules() {
        // Student Module Registration
        if (typeof studentsData !== 'undefined') {
            SchoolModules.student = {
                data: studentsData,
                functions: {
                    add: handleAdmissionSubmit,
                    update: editStudent,
                    delete: deleteStudent,
                    search: searchStudents,
                    filter: applyFilters,
                    export: exportStudents
                }
            };
        }
        
        // Admin Module Registration
        if (typeof navigateToSection !== 'undefined') {
            SchoolModules.admin = {
                functions: {
                    navigate: navigateToSection,
                    generateReports: generateReports,
                    markAttendance: markAttendance,
                    sendNotifications: sendBulkNotifications
                }
            };
        }
        
        console.log('Modules registered:', Object.keys(SchoolModules).filter(m => SchoolModules[m] !== null));
    },
    
    // Setup cross-module event listeners
    setupEventListeners() {
        // Student-related events
        moduleEventBus.on('student.added', (studentData) => {
            this.onStudentAdded(studentData);
        });
        
        moduleEventBus.on('student.updated', (studentData) => {
            this.onStudentUpdated(studentData);
        });
        
        moduleEventBus.on('student.deleted', (studentId) => {
            this.onStudentDeleted(studentId);
        });
        
        // Fee-related events
        moduleEventBus.on('fee.paid', (feeData) => {
            this.onFeePaid(feeData);
        });
        
        // Attendance-related events
        moduleEventBus.on('attendance.marked', (attendanceData) => {
            this.onAttendanceMarked(attendanceData);
        });
        
        // Communication events
        moduleEventBus.on('message.sent', (messageData) => {
            this.onMessageSent(messageData);
        });
        
        // Results events
        moduleEventBus.on('result.published', (resultData) => {
            this.onResultPublished(resultData);
        });
    },
    
    // Load and sync global data
    async loadGlobalData() {
        try {
            // Load data from Firebase or local storage
            if (typeof DatabaseHelper !== 'undefined') {
                GlobalDataStore.students = await DatabaseHelper.getAllStudents();
                GlobalDataStore.faculty = await DatabaseHelper.getCollection('faculty');
                GlobalDataStore.parents = await DatabaseHelper.getCollection('parents');
                GlobalDataStore.courses = await DatabaseHelper.getCollection('courses');
                GlobalDataStore.announcements = await DatabaseHelper.getAnnouncements();
            } else {
                // Use sample data if DatabaseHelper not available
                if (typeof SAMPLE_DATA !== 'undefined') {
                    GlobalDataStore.students = SAMPLE_DATA.students || [];
                    GlobalDataStore.faculty = SAMPLE_DATA.faculty || [];
                    GlobalDataStore.parents = SAMPLE_DATA.parents || [];
                    GlobalDataStore.courses = SAMPLE_DATA.courses || [];
                    GlobalDataStore.announcements = SAMPLE_DATA.announcements || [];
                }
            }
            
            console.log('Global data loaded:', {
                students: GlobalDataStore.students.length,
                faculty: GlobalDataStore.faculty.length,
                parents: GlobalDataStore.parents.length
            });
            
        } catch (error) {
            console.error('Error loading global data:', error);
        }
    },
    
    // Establish connections between modules
    establishConnections() {
        // Connect Student Management with Fee Management
        this.connectStudentFeeModules();
        
        // Connect Student Management with Attendance
        this.connectStudentAttendanceModules();
        
        // Connect Student Management with Parent Communication
        this.connectStudentParentModules();
        
        // Connect Student Management with Results
        this.connectStudentResultsModules();
        
        // Connect Admin Dashboard with all modules
        this.connectAdminModules();
    },
    
    // Student-Fee Module Connection
    connectStudentFeeModules() {
        // When student is added, create fee record
        moduleEventBus.on('student.added', (student) => {
            const feeRecord = {
                studentId: student.id,
                studentName: student.fullName,
                class: student.class + student.section,
                totalFee: student.fees.total,
                paidAmount: student.fees.paid,
                pendingAmount: student.fees.pending,
                dueDate: this.calculateFeeDueDate(student.admissionDate),
                status: student.fees.status
            };
            
            // Add to fee management system
            if (typeof addFeeRecord !== 'undefined') {
                addFeeRecord(feeRecord);
            }
        });
        
        // When fee is paid, update student record
        moduleEventBus.on('fee.paid', (feeData) => {
            this.updateStudentFeeStatus(feeData.studentId, feeData.amount);
        });
    },
    
    // Student-Attendance Module Connection
    connectStudentAttendanceModules() {
        // When attendance is marked, update student record
        moduleEventBus.on('attendance.marked', (attendanceData) => {
            attendanceData.students.forEach(studentAttendance => {
                this.updateStudentAttendance(studentAttendance.studentId, studentAttendance.status);
            });
        });
        
        // When student is added, initialize attendance record
        moduleEventBus.on('student.added', (student) => {
            const attendanceRecord = {
                studentId: student.id,
                studentName: student.fullName,
                class: student.class + student.section,
                totalDays: 0,
                presentDays: 0,
                absentDays: 0,
                percentage: 0
            };
            
            // Add to attendance system
            if (typeof initializeStudentAttendance !== 'undefined') {
                initializeStudentAttendance(attendanceRecord);
            }
        });
    },
    
    // Student-Parent Module Connection
    connectStudentParentModules() {
        // When student is added, create/update parent record
        moduleEventBus.on('student.added', (student) => {
            const parentRecord = {
                id: 'PAR' + student.id.substring(3),
                fatherName: student.fatherName,
                fatherPhone: student.fatherPhone,
                fatherEmail: student.fatherEmail,
                motherName: student.motherName,
                motherPhone: student.motherPhone,
                motherEmail: student.motherEmail,
                studentIds: [student.id],
                address: student.address,
                city: student.city,
                primaryContact: student.fatherPhone
            };
            
            // Add to parent system
            GlobalDataStore.parents.push(parentRecord);
        });
        
        // When message is sent to student, notify parents
        moduleEventBus.on('message.sent', (messageData) => {
            if (messageData.targetType === 'student') {
                this.notifyParents(messageData.targetId, messageData.message);
            }
        });
    },
    
    // Student-Results Module Connection
    connectStudentResultsModules() {
        // When result is published, update student performance
        moduleEventBus.on('result.published', (resultData) => {
            resultData.students.forEach(studentResult => {
                this.updateStudentPerformance(studentResult.studentId, studentResult);
            });
        });
        
        // When student is added, initialize result record
        moduleEventBus.on('student.added', (student) => {
            const resultRecord = {
                studentId: student.id,
                studentName: student.fullName,
                class: student.class + student.section,
                results: [],
                averagePercentage: 0,
                rank: null
            };
            
            // Add to results system
            if (typeof initializeStudentResults !== 'undefined') {
                initializeStudentResults(resultRecord);
            }
        });
    },
    
    // Admin Module Connections
    connectAdminModules() {
        // Connect admin dashboard navigation to all modules
        if (typeof navigateToSection !== 'undefined') {
            const originalNavigate = navigateToSection;
            window.navigateToSection = (section) => {
                // Call original function
                originalNavigate(section);
                
                // Emit navigation event
                moduleEventBus.emit('admin.navigation', { section, timestamp: Date.now() });
                
                // Load section-specific data
                this.loadSectionData(section);
            };
        }
    },
    
    // Event Handlers
    onStudentAdded(studentData) {
        console.log('Student added across modules:', studentData.fullName);
        
        // Update global statistics
        this.updateGlobalStatistics();
        
        // Sync with all modules
        GlobalDataStore.students.push(studentData);
        
        // Update dashboard if available
        if (typeof updateStatsDisplay !== 'undefined') {
            updateStatsDisplay();
        }
    },
    
    onStudentUpdated(studentData) {
        console.log('Student updated across modules:', studentData.fullName);
        
        // Update in global store
        const index = GlobalDataStore.students.findIndex(s => s.id === studentData.id);
        if (index !== -1) {
            GlobalDataStore.students[index] = studentData;
        }
        
        // Notify all modules
        moduleEventBus.emit('data.sync', { type: 'student', action: 'update', data: studentData });
    },
    
    onStudentDeleted(studentId) {
        console.log('Student deleted across modules:', studentId);
        
        // Remove from global store
        GlobalDataStore.students = GlobalDataStore.students.filter(s => s.id !== studentId);
        
        // Clean up related data
        this.cleanupStudentData(studentId);
        
        // Update statistics
        this.updateGlobalStatistics();
    },
    
    onFeePaid(feeData) {
        console.log('Fee paid, updating student record:', feeData);
        this.updateStudentFeeStatus(feeData.studentId, feeData.amount);
    },
    
    onAttendanceMarked(attendanceData) {
        console.log('Attendance marked, updating records:', attendanceData);
        // Update student attendance records
    },
    
    onMessageSent(messageData) {
        console.log('Message sent:', messageData);
        // Log communication history
    },
    
    onResultPublished(resultData) {
        console.log('Result published, updating student performance:', resultData);
        // Update student performance metrics
    },
    
    // Utility Functions
    calculateFeeDueDate(admissionDate) {
        const admission = new Date(admissionDate);
        const dueDate = new Date(admission);
        dueDate.setMonth(admission.getMonth() + 3); // 3 months from admission
        return dueDate.toISOString().split('T')[0];
    },
    
    updateStudentFeeStatus(studentId, paidAmount) {
        const student = GlobalDataStore.students.find(s => s.id === studentId);
        if (student) {
            student.fees.paid += paidAmount;
            student.fees.pending = Math.max(0, student.fees.total - student.fees.paid);
            student.fees.status = student.fees.pending === 0 ? 'paid' : 'pending';
            
            // Update in student management module
            if (typeof studentsData !== 'undefined') {
                const localStudent = studentsData.find(s => s.id === studentId);
                if (localStudent) {
                    localStudent.fees = { ...student.fees };
                }
            }
            
            // Re-render if function available
            if (typeof renderStudents !== 'undefined') {
                renderStudents();
            }
        }
    },
    
    updateStudentAttendance(studentId, attendancePercentage) {
        const student = GlobalDataStore.students.find(s => s.id === studentId);
        if (student) {
            student.attendance.percentage = attendancePercentage;
            
            // Update in student management module
            if (typeof studentsData !== 'undefined') {
                const localStudent = studentsData.find(s => s.id === studentId);
                if (localStudent) {
                    localStudent.attendance.percentage = attendancePercentage;
                }
            }
        }
    },
    
    updateStudentPerformance(studentId, resultData) {
        const student = GlobalDataStore.students.find(s => s.id === studentId);
        if (student) {
            student.performance = {
                ...student.performance,
                lastExamMarks: resultData.marks,
                lastExamTotal: resultData.total,
                lastExamPercentage: resultData.percentage,
                rank: resultData.rank
            };
        }
    },
    
    notifyParents(studentId, message) {
        const student = GlobalDataStore.students.find(s => s.id === studentId);
        if (student) {
            const parentNotification = {
                to: [student.fatherPhone, student.motherPhone].filter(Boolean),
                message: `Message regarding ${student.fullName}: ${message}`,
                timestamp: Date.now()
            };
            
            console.log('Notifying parents:', parentNotification);
            // In real implementation, send SMS/Email
        }
    },
    
    cleanupStudentData(studentId) {
        // Remove from all related collections
        GlobalDataStore.parents = GlobalDataStore.parents.filter(p => !p.studentIds.includes(studentId));
        
        // Clean up attendance records
        if (GlobalDataStore.attendance) {
            GlobalDataStore.attendance = GlobalDataStore.attendance.filter(a => a.studentId !== studentId);
        }
        
        // Clean up fee records
        if (GlobalDataStore.fees) {
            GlobalDataStore.fees = GlobalDataStore.fees.filter(f => f.studentId !== studentId);
        }
        
        // Clean up result records
        if (GlobalDataStore.results) {
            GlobalDataStore.results = GlobalDataStore.results.filter(r => r.studentId !== studentId);
        }
    },
    
    updateGlobalStatistics() {
        const stats = {
            totalStudents: GlobalDataStore.students.length,
            activeStudents: GlobalDataStore.students.filter(s => s.status === 'active').length,
            totalFaculty: GlobalDataStore.faculty.length,
            totalParents: GlobalDataStore.parents.length,
            pendingFees: GlobalDataStore.students.filter(s => s.fees.status === 'pending').length,
            averageAttendance: GlobalDataStore.students.length > 0 ? 
                (GlobalDataStore.students.reduce((sum, s) => sum + s.attendance.percentage, 0) / GlobalDataStore.students.length).toFixed(1) : 0
        };
        
        // Update dashboard statistics if function available
        if (typeof updateOverviewStats !== 'undefined') {
            updateOverviewStats(stats);
        }
        
        console.log('Global statistics updated:', stats);
        return stats;
    },
    
    loadSectionData(section) {
        switch (section) {
            case 'students':
                if (typeof loadStudentsData !== 'undefined') {
                    loadStudentsData();
                }
                break;
            case 'faculty':
                if (typeof loadFacultyData !== 'undefined') {
                    loadFacultyData();
                }
                break;
            case 'attendance':
                if (typeof loadAttendanceData !== 'undefined') {
                    loadAttendanceData();
                }
                break;
            case 'fees':
                if (typeof loadFeesData !== 'undefined') {
                    loadFeesData();
                }
                break;
            case 'results':
                if (typeof loadResultsData !== 'undefined') {
                    loadResultsData();
                }
                break;
        }
    },
    
    // Public API for modules to communicate
    getStudentById(studentId) {
        return GlobalDataStore.students.find(s => s.id === studentId);
    },
    
    getStudentsByClass(className) {
        return GlobalDataStore.students.filter(s => s.class === className);
    },
    
    getFacultyById(facultyId) {
        return GlobalDataStore.faculty.find(f => f.id === facultyId);
    },
    
    getParentByStudentId(studentId) {
        return GlobalDataStore.parents.find(p => p.studentIds.includes(studentId));
    },
    
    // Sync data across modules
    syncAllModules() {
        moduleEventBus.emit('data.sync', { 
            type: 'all', 
            data: GlobalDataStore,
            timestamp: Date.now()
        });
    }
};

// Auto-initialize when all modules are loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for all modules to load
    setTimeout(() => {
        ModuleIntegration.init();
    }, 1000);
});

// Make integration system globally available
window.ModuleIntegration = ModuleIntegration;
window.moduleEventBus = moduleEventBus;
window.GlobalDataStore = GlobalDataStore;
window.SchoolModules = SchoolModules;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModuleIntegration, moduleEventBus, GlobalDataStore, SchoolModules };
}