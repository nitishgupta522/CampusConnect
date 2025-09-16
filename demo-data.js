// Demo Data Initialization
// Populates the system with sample data for demonstration

class DemoDataManager {
    constructor() {
        this.initializeDemoData();
    }

    async initializeDemoData() {
        // Check if demo data already exists
        const hasData = localStorage.getItem('demoDataInitialized');
        if (hasData) return;

        try {
            await this.createSampleAssignments();
            await this.createSampleFees();
            await this.createSampleMessages();
            await this.createSampleResults();
            await this.createSampleNotifications();
            await this.createSampleAnnouncements();
            
            localStorage.setItem('demoDataInitialized', 'true');
            console.log('Demo data initialized successfully');
        } catch (error) {
            console.error('Error initializing demo data:', error);
        }
    }

    async createSampleAssignments() {
        const assignments = [
            {
                id: "ASSIGN_001",
                title: "Mathematics Problem Set 1",
                subject: "Mathematics",
                class: "12A",
                description: "Solve the following calculus problems. Show all your work and provide detailed solutions.",
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                maxMarks: 100,
                facultyId: "FAC001",
                facultyName: "Dr. Amit Kumar",
                status: "active",
                createdAt: new Date(),
                files: [
                    {
                        name: "problem_set_1.pdf",
                        url: "https://example.com/files/problem_set_1.pdf",
                        size: 1024000,
                        type: "application/pdf"
                    }
                ]
            },
            {
                id: "ASSIGN_002",
                title: "Physics Lab Report",
                subject: "Physics",
                class: "12A",
                description: "Complete the lab report for the optics experiment conducted last week. Include diagrams and calculations.",
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
                maxMarks: 50,
                facultyId: "FAC002",
                facultyName: "Mrs. Sunita Singh",
                status: "active",
                createdAt: new Date(),
                files: [
                    {
                        name: "lab_instructions.pdf",
                        url: "https://example.com/files/lab_instructions.pdf",
                        size: 512000,
                        type: "application/pdf"
                    }
                ]
            },
            {
                id: "ASSIGN_003",
                title: "Chemistry Assignment 2",
                subject: "Chemistry",
                class: "11B",
                description: "Complete the organic chemistry problems from chapter 12. Submit your work as a PDF.",
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                maxMarks: 75,
                facultyId: "FAC003",
                facultyName: "Dr. Rajesh Verma",
                status: "active",
                createdAt: new Date()
            }
        ];

        // Save to local storage
        localStorage.setItem('assignments', JSON.stringify(assignments));
        console.log('Sample assignments created');
    }

    async createSampleFees() {
        const fees = [
            {
                studentId: "STU001",
                studentName: "Rahul Sharma",
                class: "12A",
                feeType: "Tuition Fee",
                totalAmount: 50000,
                paidAmount: 30000,
                pendingAmount: 20000,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                status: "pending",
                academicYear: "2024-25",
                semester: "1"
            },
            {
                studentId: "STU002",
                studentName: "Priya Gupta",
                class: "11B",
                feeType: "Tuition Fee",
                totalAmount: 48000,
                paidAmount: 48000,
                pendingAmount: 0,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: "paid",
                academicYear: "2024-25",
                semester: "1"
            }
        ];

        // Save to local storage
        localStorage.setItem('fees', JSON.stringify(fees));
        console.log('Sample fees created');
    }

    async createSampleMessages() {
        const messages = [
            {
                recipientId: "STU001",
                recipientType: "student",
                senderId: "FAC001",
                senderName: "Dr. Amit Kumar",
                title: "Assignment Reminder",
                content: "Please remember to submit your mathematics assignment by the due date. Contact me if you have any questions.",
                type: "assignment",
                priority: "medium"
            },
            {
                recipientId: "STU001",
                recipientType: "student",
                senderId: "ADMIN001",
                senderName: "School Administration",
                title: "Fee Payment Reminder",
                content: "Your tuition fee payment is due soon. Please make the payment to avoid any late fees.",
                type: "fee",
                priority: "high"
            },
            {
                recipientId: "STU002",
                recipientType: "student",
                senderId: "FAC002",
                senderName: "Mrs. Sunita Singh",
                title: "Lab Schedule Update",
                content: "The physics lab session for tomorrow has been rescheduled to 2 PM. Please make a note of this change.",
                type: "schedule",
                priority: "medium"
            }
        ];

        // Save to local storage
        localStorage.setItem('messages', JSON.stringify(messages));
        console.log('Sample messages created');
    }

    async createSampleResults() {
        const results = [
            {
                studentId: "STU001",
                studentName: "Rahul Sharma",
                class: "12A",
                examName: "Midterm Examination",
                examType: "midterm",
                subject: "Mathematics",
                obtainedMarks: 85,
                maxMarks: 100,
                percentage: 85,
                grade: "A",
                rank: 5,
                publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
            },
            {
                studentId: "STU001",
                studentName: "Rahul Sharma",
                class: "12A",
                examName: "Physics Test",
                examType: "test",
                subject: "Physics",
                obtainedMarks: 78,
                maxMarks: 100,
                percentage: 78,
                grade: "B+",
                rank: 8,
                publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
            },
            {
                studentId: "STU002",
                studentName: "Priya Gupta",
                class: "11B",
                examName: "Chemistry Quiz",
                examType: "quiz",
                subject: "Chemistry",
                obtainedMarks: 92,
                maxMarks: 100,
                percentage: 92,
                grade: "A+",
                rank: 2,
                publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
            }
        ];

        // Save to local storage
        localStorage.setItem('results', JSON.stringify(results));
        console.log('Sample results created');
    }

    async createSampleNotifications() {
        const notifications = [
            {
                recipientId: "STU001",
                recipientType: "student",
                title: "New Assignment Posted",
                message: "A new mathematics assignment has been posted. Check your assignments section.",
                type: "assignment",
                priority: "high"
            },
            {
                recipientId: "STU001",
                recipientType: "student",
                title: "Fee Payment Due",
                message: "Your tuition fee payment is due in 5 days. Please make the payment soon.",
                type: "fee",
                priority: "urgent"
            },
            {
                recipientId: "STU002",
                recipientType: "student",
                title: "Result Published",
                message: "Your chemistry quiz result has been published. Check your results section.",
                type: "result",
                priority: "medium"
            }
        ];

        // Save to local storage
        localStorage.setItem('notifications', JSON.stringify(notifications));
        console.log('Sample notifications created');
    }

    async createSampleAnnouncements() {
        const announcements = [
            {
                title: "Annual Sports Day 2025",
                content: "The annual sports day will be held on March 15, 2025. All students are encouraged to participate in various sports events. Registration forms are available at the sports office.",
                type: "event",
                priority: "high",
                targetAudience: ["students", "parents", "faculty"],
                createdBy: "ADMIN001",
                createdByName: "School Administration"
            },
            {
                title: "Library Hours Extended",
                content: "The school library will now remain open until 8 PM on weekdays to help students with their studies. Please make use of this extended facility.",
                type: "academic",
                priority: "medium",
                targetAudience: ["students", "faculty"],
                createdBy: "ADMIN001",
                createdByName: "Library Department"
            },
            {
                title: "Exam Schedule Released",
                content: "The final examination schedule for the current academic year has been released. Please check the notice board or school website for detailed information.",
                type: "academic",
                priority: "urgent",
                targetAudience: ["students", "parents"],
                createdBy: "ADMIN001",
                createdByName: "Examination Department"
            }
        ];

        // Save to local storage
        localStorage.setItem('announcements', JSON.stringify(announcements));
        console.log('Sample announcements created');
    }
}

// Initialize demo data when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize demo data immediately
    new DemoDataManager();
});

// Make it globally available
window.DemoDataManager = DemoDataManager;
