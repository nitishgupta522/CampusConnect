// Real-time Updates System
// Handles real-time updates for fees, messages, results, and notifications

class RealtimeUpdatesManager {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        this.listeners = [];
        this.initialize();
    }

    async initialize() {
        // Get current user from localStorage
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.currentRole = this.currentUser.role;
        }

        // Initialize real-time listeners based on role
        if (this.currentRole === 'student') {
            this.initializeStudentUpdates();
        } else if (this.currentRole === 'faculty') {
            this.initializeFacultyUpdates();
        } else if (this.currentRole === 'admin') {
            this.initializeAdminUpdates();
        }
    }

    initializeStudentUpdates() {
        // Listen to fees updates
        this.listenToFees();
        
        // Listen to messages
        this.listenToMessages();
        
        // Listen to results
        this.listenToResults();
        
        // Listen to notifications
        this.listenToNotifications();
        
        // Listen to announcements
        this.listenToAnnouncements();
    }

    initializeFacultyUpdates() {
        // Listen to assignment submissions
        this.listenToAssignmentSubmissions();
        
        // Listen to messages
        this.listenToMessages();
        
        // Listen to notifications
        this.listenToNotifications();
    }

    initializeAdminUpdates() {
        // Listen to all updates
        this.listenToFees();
        this.listenToMessages();
        this.listenToResults();
        this.listenToNotifications();
        this.listenToAnnouncements();
    }

    listenToFees() {
        if (typeof RealtimeListeners !== 'undefined' && this.currentUser) {
            const unsubscribe = RealtimeListeners.listenToFeeUpdates(
                this.currentUser.id,
                (snapshot) => {
                    const fees = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    this.updateFeesDisplay(fees);
                }
            );
            this.listeners.push(unsubscribe);
        }
    }

    listenToMessages() {
        if (typeof RealtimeListeners !== 'undefined' && this.currentUser) {
            const unsubscribe = RealtimeListeners.listenToMessages(
                this.currentUser.id,
                this.currentRole,
                (snapshot) => {
                    const messages = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    this.updateMessagesDisplay(messages);
                }
            );
            this.listeners.push(unsubscribe);
        }
    }

    listenToResults() {
        if (typeof RealtimeListeners !== 'undefined' && this.currentUser) {
            // Listen to results for the student
            const unsubscribe = db.collection('results')
                .where('studentId', '==', this.currentUser.id)
                .orderBy('publishedAt', 'desc')
                .limit(10)
                .onSnapshot((snapshot) => {
                    const results = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    this.updateResultsDisplay(results);
                });
            this.listeners.push(unsubscribe);
        }
    }

    listenToNotifications() {
        if (typeof RealtimeListeners !== 'undefined' && this.currentUser) {
            const unsubscribe = RealtimeListeners.listenToNotifications(
                this.currentUser.id,
                this.currentRole,
                (snapshot) => {
                    const notifications = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    this.updateNotificationsDisplay(notifications);
                }
            );
            this.listeners.push(unsubscribe);
        }
    }

    listenToAnnouncements() {
        if (typeof RealtimeListeners !== 'undefined') {
            const unsubscribe = RealtimeListeners.listenToAnnouncements(
                (snapshot) => {
                    const announcements = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    this.updateAnnouncementsDisplay(announcements);
                }
            );
            this.listeners.push(unsubscribe);
        }
    }

    listenToAssignmentSubmissions() {
        if (typeof RealtimeListeners !== 'undefined' && this.currentUser) {
            // Listen to all assignment submissions for faculty's assignments
            const unsubscribe = db.collection('assignment_submissions')
                .where('facultyId', '==', this.currentUser.id)
                .orderBy('submittedAt', 'desc')
                .limit(20)
                .onSnapshot((snapshot) => {
                    const submissions = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    this.updateAssignmentSubmissionsDisplay(submissions);
                });
            this.listeners.push(unsubscribe);
        }
    }

    updateFeesDisplay(fees) {
        // Update fee status in student dashboard
        const feeStatusElement = document.getElementById('feeStatus');
        if (feeStatusElement && fees.length > 0) {
            const latestFee = fees[0];
            if (latestFee.pendingAmount === 0) {
                feeStatusElement.textContent = 'Paid';
                feeStatusElement.className = 'status-paid';
            } else {
                feeStatusElement.textContent = 'Pending';
                feeStatusElement.className = 'status-pending';
            }
        }

        // Update fees section if it exists
        const feesSection = document.getElementById('fees-section');
        if (feesSection) {
            this.renderFeesSection(fees);
        }
    }

    updateMessagesDisplay(messages) {
        // Update messages section if it exists
        const messagesSection = document.getElementById('messages-section');
        if (messagesSection) {
            this.renderMessagesSection(messages);
        }

        // Update notification badge
        this.updateMessageNotificationBadge(messages);
    }

    updateResultsDisplay(results) {
        // Update average score in student dashboard
        const avgScoreElement = document.getElementById('avgScore');
        if (avgScoreElement && results.length > 0) {
            const totalMarks = results.reduce((sum, result) => sum + (result.obtainedMarks || 0), 0);
            const totalMaxMarks = results.reduce((sum, result) => sum + (result.maxMarks || 100), 0);
            const averagePercentage = totalMaxMarks > 0 ? Math.round((totalMarks / totalMaxMarks) * 100) : 0;
            avgScoreElement.textContent = averagePercentage + '%';
        }

        // Update results section if it exists
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
            this.renderResultsSection(results);
        }
    }

    updateNotificationsDisplay(notifications) {
        // Update notification badge
        const unreadCount = notifications.filter(n => !n.read).length;
        this.updateNotificationBadge(unreadCount);

        // Show notification toast for new notifications
        const newNotifications = notifications.filter(n => 
            !n.read && new Date(n.createdAt?.toDate?.() || n.createdAt) > new Date(Date.now() - 5000)
        );
        
        newNotifications.forEach(notification => {
            this.showNotificationToast(notification);
        });
    }

    updateAnnouncementsDisplay(announcements) {
        // Update announcements section if it exists
        const announcementsSection = document.getElementById('announcements-section');
        if (announcementsSection) {
            this.renderAnnouncementsSection(announcements);
        }
    }

    updateAssignmentSubmissionsDisplay(submissions) {
        // Update pending assignments count for faculty
        const pendingCount = submissions.filter(s => s.status === 'submitted').length;
        const pendingElement = document.getElementById('pendingAssignments');
        if (pendingElement) {
            pendingElement.textContent = pendingCount;
        }
    }

    renderFeesSection(fees) {
        const container = document.getElementById('fees-section');
        if (!container) return;

        if (fees.length === 0) {
            container.innerHTML = '<div class="placeholder">No fee records found.</div>';
            return;
        }

        const latestFee = fees[0];
        container.innerHTML = `
            <div class="fees-overview">
                <div class="fee-summary">
                    <div class="fee-item">
                        <h3>Total Fee</h3>
                        <p class="amount">₹${latestFee.totalAmount || 0}</p>
                    </div>
                    <div class="fee-item">
                        <h3>Paid Amount</h3>
                        <p class="amount paid">₹${latestFee.paidAmount || 0}</p>
                    </div>
                    <div class="fee-item">
                        <h3>Pending Amount</h3>
                        <p class="amount ${latestFee.pendingAmount > 0 ? 'pending' : 'paid'}">₹${latestFee.pendingAmount || 0}</p>
                    </div>
                </div>
                <div class="fee-details">
                    <h3>Recent Fee Records</h3>
                    <div class="fee-list">
                        ${fees.slice(0, 5).map(fee => `
                            <div class="fee-record">
                                <div class="fee-info">
                                    <span class="fee-type">${fee.feeType || 'Tuition Fee'}</span>
                                    <span class="fee-date">${this.formatDate(fee.createdAt)}</span>
                                </div>
                                <div class="fee-amount">
                                    <span class="amount">₹${fee.amount}</span>
                                    <span class="status status-${fee.status}">${fee.status}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderMessagesSection(messages) {
        const container = document.getElementById('messages-section');
        if (!container) return;

        if (messages.length === 0) {
            container.innerHTML = '<div class="placeholder">No messages found.</div>';
            return;
        }

        container.innerHTML = `
            <div class="messages-overview">
                <div class="messages-header">
                    <h3>Recent Messages</h3>
                    <span class="message-count">${messages.length} messages</span>
                </div>
                <div class="messages-list">
                    ${messages.slice(0, 10).map(message => `
                        <div class="message-item ${!message.read ? 'unread' : ''}">
                            <div class="message-header">
                                <span class="sender">${message.senderName || 'System'}</span>
                                <span class="message-date">${this.formatDate(message.sentAt)}</span>
                            </div>
                            <div class="message-content">
                                <p>${message.content}</p>
                            </div>
                            ${message.type ? `<span class="message-type">${message.type}</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderResultsSection(results) {
        const container = document.getElementById('results-section');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = '<div class="placeholder">No results found.</div>';
            return;
        }

        container.innerHTML = `
            <div class="results-overview">
                <div class="results-header">
                    <h3>Recent Results</h3>
                    <span class="results-count">${results.length} results</span>
                </div>
                <div class="results-list">
                    ${results.slice(0, 10).map(result => `
                        <div class="result-item">
                            <div class="result-header">
                                <span class="exam-name">${result.examName || 'Exam'}</span>
                                <span class="result-date">${this.formatDate(result.publishedAt)}</span>
                            </div>
                            <div class="result-details">
                                <div class="result-marks">
                                    <span>Obtained: ${result.obtainedMarks || 0}</span>
                                    <span>Total: ${result.maxMarks || 100}</span>
                                    <span class="percentage">${result.percentage || 0}%</span>
                                </div>
                                <div class="result-grade">
                                    <span class="grade">Grade: ${result.grade || 'N/A'}</span>
                                    <span class="rank">Rank: ${result.rank || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderAnnouncementsSection(announcements) {
        const container = document.getElementById('announcements-section');
        if (!container) return;

        if (announcements.length === 0) {
            container.innerHTML = '<div class="placeholder">No announcements found.</div>';
            return;
        }

        container.innerHTML = `
            <div class="announcements-overview">
                <div class="announcements-header">
                    <h3>Recent Announcements</h3>
                    <span class="announcements-count">${announcements.length} announcements</span>
                </div>
                <div class="announcements-list">
                    ${announcements.slice(0, 5).map(announcement => `
                        <div class="announcement-item ${announcement.priority}">
                            <div class="announcement-header">
                                <span class="announcement-title">${announcement.title}</span>
                                <span class="announcement-date">${this.formatDate(announcement.createdAt)}</span>
                            </div>
                            <div class="announcement-content">
                                <p>${announcement.content}</p>
                            </div>
                            <div class="announcement-meta">
                                <span class="announcement-type">${announcement.type}</span>
                                <span class="announcement-priority priority-${announcement.priority}">${announcement.priority}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    updateNotificationBadge(count) {
        const badge = document.querySelector('.badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    updateMessageNotificationBadge(messages) {
        const unreadCount = messages.filter(m => !m.read).length;
        const messageMenuItem = document.querySelector('[data-section="messages"] .count');
        if (messageMenuItem) {
            if (unreadCount > 0) {
                messageMenuItem.textContent = unreadCount;
                messageMenuItem.classList.add('new');
            } else {
                messageMenuItem.textContent = '';
                messageMenuItem.classList.remove('new');
            }
        }
    }

    showNotificationToast(notification) {
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">
                    <i class="fas fa-bell"></i>
                </div>
                <div class="toast-message">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                </div>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);

        // Mark as read when clicked
        toast.addEventListener('click', () => {
            this.markNotificationAsRead(notification.id);
            toast.remove();
        });
    }

    async markNotificationAsRead(notificationId) {
        try {
            if (typeof DatabaseHelper !== 'undefined') {
                await DatabaseHelper.markNotificationAsRead(notificationId);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    formatDate(date) {
        if (!date) return 'N/A';
        
        let dateObj;
        if (date.toDate) {
            dateObj = date.toDate();
        } else if (typeof date === 'string') {
            dateObj = new Date(date);
        } else {
            dateObj = date;
        }

        return dateObj.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Cleanup listeners when component is destroyed
    destroy() {
        this.listeners.forEach(unsubscribe => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });
        this.listeners = [];
    }
}

// Initialize real-time updates when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a dashboard page
    if (document.querySelector('.dashboard-body')) {
        window.realtimeUpdatesManager = new RealtimeUpdatesManager();
    }
});

// Add CSS for notification toast
const style = document.createElement('style');
style.textContent = `
    .notification-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 1001;
        max-width: 400px;
        cursor: pointer;
        animation: slideInRight 0.3s ease;
    }

    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .toast-content {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
    }

    .toast-icon {
        width: 40px;
        height: 40px;
        background: #3b82f6;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .toast-message {
        flex: 1;
    }

    .toast-message h4 {
        margin: 0 0 4px 0;
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
    }

    .toast-message p {
        margin: 0;
        font-size: 13px;
        color: #6b7280;
        line-height: 1.4;
    }

    .toast-close {
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        flex-shrink: 0;
    }

    .toast-close:hover {
        background: #f3f4f6;
        color: #374151;
    }

    .fees-overview, .messages-overview, .results-overview, .announcements-overview {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .fee-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 20px;
        margin-bottom: 24px;
    }

    .fee-item h3 {
        margin: 0 0 8px 0;
        font-size: 14px;
        color: #6b7280;
        font-weight: 500;
    }

    .fee-item .amount {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        color: #1f2937;
    }

    .fee-item .amount.paid {
        color: #059669;
    }

    .fee-item .amount.pending {
        color: #dc2626;
    }

    .fee-list, .messages-list, .results-list, .announcements-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .fee-record, .message-item, .result-item, .announcement-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        background: #f9fafb;
    }

    .message-item.unread {
        background: #eff6ff;
        border-color: #3b82f6;
    }

    .announcement-item.high {
        border-left: 4px solid #ef4444;
    }

    .announcement-item.urgent {
        border-left: 4px solid #dc2626;
        background: #fef2f2;
    }

    .fee-info, .message-header, .result-header, .announcement-header {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .fee-type, .sender, .exam-name, .announcement-title {
        font-weight: 600;
        color: #1f2937;
        font-size: 14px;
    }

    .fee-date, .message-date, .result-date, .announcement-date {
        font-size: 12px;
        color: #6b7280;
    }

    .fee-amount, .message-content, .result-details, .announcement-content {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
    }

    .result-marks, .result-grade {
        display: flex;
        gap: 12px;
        font-size: 13px;
    }

    .percentage, .grade {
        font-weight: 600;
        color: #1f2937;
    }

    .status-paid {
        color: #059669;
        background: #ecfdf5;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
    }

    .status-pending {
        color: #b45309;
        background: #fffbeb;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
    }

    .priority-high {
        color: #ef4444;
        background: #fef2f2;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
    }

    .priority-urgent {
        color: #dc2626;
        background: #fef2f2;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
    }

    .message-type {
        background: #e5e7eb;
        color: #374151;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
    }
`;
document.head.appendChild(style);

