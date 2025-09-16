// Advanced Notification System
// Handles all types of notifications with priority, persistence, and user preferences

class NotificationSystem {
    constructor() {
        this.notifications = new Map();
        this.userPreferences = this.loadUserPreferences();
        this.setupEventListeners();
        this.initializeNotificationCenter();
    }

    setupEventListeners() {
        // Listen for page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateNotificationBadges();
            }
        });

        // Listen for storage changes (cross-tab notifications)
        window.addEventListener('storage', (e) => {
            if (e.key === 'campus_connect_notifications') {
                this.handleStorageChange(e.newValue);
            }
        });
    }

    initializeNotificationCenter() {
        // Create notification center if it doesn't exist
        if (!document.getElementById('notificationCenter')) {
            this.createNotificationCenter();
        }
    }

    createNotificationCenter() {
        const notificationCenter = document.createElement('div');
        notificationCenter.id = 'notificationCenter';
        notificationCenter.className = 'notification-center';
        notificationCenter.innerHTML = `
            <div class="notification-header">
                <h3>Notifications</h3>
                <div class="notification-actions">
                    <button class="btn-mark-all-read" onclick="notificationSystem.markAllAsRead()">
                        Mark All Read
                    </button>
                    <button class="btn-clear-all" onclick="notificationSystem.clearAllNotifications()">
                        Clear All
                    </button>
                </div>
            </div>
            <div class="notification-list" id="notificationList">
                <!-- Notifications will be loaded here -->
            </div>
            <div class="notification-settings">
                <button class="btn-settings" onclick="notificationSystem.showSettings()">
                    <i class="fas fa-cog"></i> Settings
                </button>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .notification-center {
                position: fixed;
                top: 70px;
                right: 20px;
                width: 400px;
                max-height: 600px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                display: none;
                overflow: hidden;
            }

            .notification-center.show {
                display: block;
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

            .notification-header {
                padding: 16px 20px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #f9fafb;
            }

            .notification-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: #111827;
            }

            .notification-actions {
                display: flex;
                gap: 8px;
            }

            .notification-actions button {
                padding: 4px 8px;
                font-size: 12px;
                border: 1px solid #d1d5db;
                background: white;
                border-radius: 4px;
                cursor: pointer;
                color: #374151;
            }

            .notification-actions button:hover {
                background: #f3f4f6;
            }

            .notification-list {
                max-height: 400px;
                overflow-y: auto;
            }

            .notification-item {
                padding: 12px 20px;
                border-bottom: 1px solid #f3f4f6;
                cursor: pointer;
                transition: background-color 0.2s;
            }

            .notification-item:hover {
                background: #f9fafb;
            }

            .notification-item.unread {
                background: #eff6ff;
                border-left: 4px solid #3b82f6;
            }

            .notification-item.urgent {
                background: #fef2f2;
                border-left: 4px solid #ef4444;
            }

            .notification-content {
                display: flex;
                align-items: flex-start;
                gap: 12px;
            }

            .notification-icon {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .notification-icon.info {
                background: #dbeafe;
                color: #3b82f6;
            }

            .notification-icon.success {
                background: #dcfce7;
                color: #16a34a;
            }

            .notification-icon.warning {
                background: #fef3c7;
                color: #d97706;
            }

            .notification-icon.error {
                background: #fee2e2;
                color: #dc2626;
            }

            .notification-details {
                flex: 1;
                min-width: 0;
            }

            .notification-title {
                font-weight: 600;
                font-size: 14px;
                color: #111827;
                margin: 0 0 4px 0;
            }

            .notification-message {
                font-size: 13px;
                color: #6b7280;
                margin: 0 0 4px 0;
                line-height: 1.4;
            }

            .notification-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 12px;
                color: #9ca3af;
            }

            .notification-time {
                font-size: 12px;
            }

            .notification-priority {
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 500;
                text-transform: uppercase;
            }

            .notification-priority.high {
                background: #fef2f2;
                color: #dc2626;
            }

            .notification-priority.medium {
                background: #fffbeb;
                color: #d97706;
            }

            .notification-priority.low {
                background: #f0f9ff;
                color: #0284c7;
            }

            .notification-settings {
                padding: 12px 20px;
                border-top: 1px solid #e5e7eb;
                background: #f9fafb;
            }

            .btn-settings {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                background: white;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                color: #374151;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .btn-settings:hover {
                background: #f3f4f6;
            }

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

            .toast-content {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 16px;
            }

            .toast-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .toast-message {
                flex: 1;
                min-width: 0;
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
        `;
        document.head.appendChild(style);
    }

    // Create notification
    createNotification(data) {
        const notification = {
            id: data.id || this.generateId(),
            type: data.type || 'info',
            priority: data.priority || 'medium',
            title: data.title,
            message: data.message,
            recipientId: data.recipientId,
            recipientType: data.recipientType,
            senderId: data.senderId,
            senderName: data.senderName,
            actionUrl: data.actionUrl,
            actionText: data.actionText,
            metadata: data.metadata || {},
            createdAt: new Date(),
            read: false,
            dismissed: false
        };

        this.notifications.set(notification.id, notification);
        this.saveNotifications();
        this.displayNotification(notification);
        this.updateNotificationBadges();

        return notification.id;
    }

    // Display notification
    displayNotification(notification) {
        // Check user preferences
        if (!this.shouldShowNotification(notification)) {
            return;
        }

        // Show toast notification
        if (this.userPreferences.showToasts) {
            this.showToastNotification(notification);
        }

        // Update notification center
        this.updateNotificationCenter();

        // Play sound if enabled
        if (this.userPreferences.playSound) {
            this.playNotificationSound(notification.priority);
        }

        // Send browser notification if permission granted
        if (this.userPreferences.browserNotifications && Notification.permission === 'granted') {
            this.showBrowserNotification(notification);
        }
    }

    // Show toast notification
    showToastNotification(notification) {
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.dataset.notificationId = notification.id;

        const iconClass = this.getIconClass(notification.type);
        const iconElement = this.getIconElement(notification.type);

        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon ${notification.type}">
                    ${iconElement}
                </div>
                <div class="toast-message">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                </div>
                <button class="toast-close" onclick="notificationSystem.dismissToast('${notification.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(toast);

        // Auto dismiss after delay
        setTimeout(() => {
            this.dismissToast(notification.id);
        }, this.getToastDuration(notification.priority));

        // Mark as read when clicked
        toast.addEventListener('click', () => {
            this.markAsRead(notification.id);
            this.dismissToast(notification.id);
        });
    }

    // Show browser notification
    showBrowserNotification(notification) {
        const browserNotification = new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: notification.id
        });

        browserNotification.onclick = () => {
            this.markAsRead(notification.id);
            browserNotification.close();
        };

        setTimeout(() => {
            browserNotification.close();
        }, 5000);
    }

    // Update notification center
    updateNotificationCenter() {
        const notificationList = document.getElementById('notificationList');
        if (!notificationList) return;

        const userNotifications = this.getUserNotifications();
        const unreadCount = userNotifications.filter(n => !n.read).length;

        if (userNotifications.length === 0) {
            notificationList.innerHTML = `
                <div style="padding: 40px 20px; text-align: center; color: #6b7280;">
                    <i class="fas fa-bell-slash" style="font-size: 24px; margin-bottom: 8px;"></i>
                    <p>No notifications</p>
                </div>
            `;
            return;
        }

        notificationList.innerHTML = userNotifications.map(notification => `
            <div class="notification-item ${!notification.read ? 'unread' : ''} ${notification.priority === 'urgent' ? 'urgent' : ''}" 
                 onclick="notificationSystem.markAsRead('${notification.id}')">
                <div class="notification-content">
                    <div class="notification-icon ${notification.type}">
                        ${this.getIconElement(notification.type)}
                    </div>
                    <div class="notification-details">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-message">${notification.message}</div>
                        <div class="notification-meta">
                            <span class="notification-time">${this.formatTimeAgo(notification.createdAt)}</span>
                            <span class="notification-priority ${notification.priority}">${notification.priority}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Update notification badges
    updateNotificationBadges() {
        const userNotifications = this.getUserNotifications();
        const unreadCount = userNotifications.filter(n => !n.read).length;

        // Update header badge
        const headerBadge = document.querySelector('.header-actions .badge');
        if (headerBadge) {
            if (unreadCount > 0) {
                headerBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                headerBadge.style.display = 'block';
            } else {
                headerBadge.style.display = 'none';
            }
        }

        // Update menu item badges
        const menuItems = document.querySelectorAll('.menu-item[data-section="notifications"]');
        menuItems.forEach(item => {
            const badge = item.querySelector('.count');
            if (badge) {
                if (unreadCount > 0) {
                    badge.textContent = unreadCount;
                    badge.classList.add('new');
                } else {
                    badge.textContent = '';
                    badge.classList.remove('new');
                }
            }
        });
    }

    // Get user notifications
    getUserNotifications() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (!currentUser.id) return [];

        return Array.from(this.notifications.values())
            .filter(n => n.recipientId === currentUser.id && !n.dismissed)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Mark notification as read
    markAsRead(notificationId) {
        const notification = this.notifications.get(notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.updateNotificationCenter();
            this.updateNotificationBadges();
        }
    }

    // Mark all notifications as read
    markAllAsRead() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (!currentUser.id) return;

        this.notifications.forEach(notification => {
            if (notification.recipientId === currentUser.id) {
                notification.read = true;
            }
        });

        this.saveNotifications();
        this.updateNotificationCenter();
        this.updateNotificationBadges();
    }

    // Clear all notifications
    clearAllNotifications() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (!currentUser.id) return;

        this.notifications.forEach(notification => {
            if (notification.recipientId === currentUser.id) {
                notification.dismissed = true;
            }
        });

        this.saveNotifications();
        this.updateNotificationCenter();
        this.updateNotificationBadges();
    }

    // Dismiss toast
    dismissToast(notificationId) {
        const toast = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (toast) {
            toast.remove();
        }
    }

    // Show notification center
    showNotificationCenter() {
        const center = document.getElementById('notificationCenter');
        if (center) {
            center.classList.add('show');
            this.updateNotificationCenter();
        }
    }

    // Hide notification center
    hideNotificationCenter() {
        const center = document.getElementById('notificationCenter');
        if (center) {
            center.classList.remove('show');
        }
    }

    // Toggle notification center
    toggleNotificationCenter() {
        const center = document.getElementById('notificationCenter');
        if (center) {
            if (center.classList.contains('show')) {
                this.hideNotificationCenter();
            } else {
                this.showNotificationCenter();
            }
        }
    }

    // Show settings
    showSettings() {
        // TODO: Implement notification settings modal
        alert('Notification settings coming soon!');
    }

    // Utility methods
    generateId() {
        return 'NOTIF_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getIconClass(type) {
        const iconMap = {
            info: 'fas fa-info-circle',
            success: 'fas fa-check-circle',
            warning: 'fas fa-exclamation-triangle',
            error: 'fas fa-times-circle',
            assignment: 'fas fa-file-alt',
            fee: 'fas fa-rupee-sign',
            attendance: 'fas fa-calendar-check',
            result: 'fas fa-chart-line',
            message: 'fas fa-envelope',
            announcement: 'fas fa-bullhorn'
        };
        return iconMap[type] || iconMap.info;
    }

    getIconElement(type) {
        const iconClass = this.getIconClass(type);
        return `<i class="${iconClass}"></i>`;
    }

    getToastDuration(priority) {
        const durations = {
            urgent: 8000,
            high: 6000,
            medium: 4000,
            low: 3000
        };
        return durations[priority] || durations.medium;
    }

    formatTimeAgo(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }

    shouldShowNotification(notification) {
        // Check if user has disabled this type of notification
        if (this.userPreferences.disabledTypes.includes(notification.type)) {
            return false;
        }

        // Check if user has disabled this priority
        if (this.userPreferences.disabledPriorities.includes(notification.priority)) {
            return false;
        }

        return true;
    }

    playNotificationSound(priority) {
        // Create audio context for notification sounds
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Different frequencies for different priorities
        const frequencies = {
            urgent: 800,
            high: 600,
            medium: 400,
            low: 300
        };

        oscillator.frequency.setValueAtTime(frequencies[priority] || 400, audioContext.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    // Storage methods
    saveNotifications() {
        try {
            const notificationsArray = Array.from(this.notifications.values());
            localStorage.setItem('campus_connect_notifications', JSON.stringify(notificationsArray));
        } catch (error) {
            console.error('Failed to save notifications:', error);
        }
    }

    loadNotifications() {
        try {
            const stored = localStorage.getItem('campus_connect_notifications');
            if (stored) {
                const notificationsArray = JSON.parse(stored);
                notificationsArray.forEach(notification => {
                    this.notifications.set(notification.id, notification);
                });
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    }

    loadUserPreferences() {
        try {
            const stored = localStorage.getItem('campus_connect_notification_preferences');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load user preferences:', error);
        }

        // Default preferences
        return {
            showToasts: true,
            playSound: true,
            browserNotifications: false,
            disabledTypes: [],
            disabledPriorities: []
        };
    }

    saveUserPreferences() {
        try {
            localStorage.setItem('campus_connect_notification_preferences', JSON.stringify(this.userPreferences));
        } catch (error) {
            console.error('Failed to save user preferences:', error);
        }
    }

    handleStorageChange(newValue) {
        if (newValue) {
            try {
                const notificationsArray = JSON.parse(newValue);
                this.notifications.clear();
                notificationsArray.forEach(notification => {
                    this.notifications.set(notification.id, notification);
                });
                this.updateNotificationCenter();
                this.updateNotificationBadges();
            } catch (error) {
                console.error('Failed to handle storage change:', error);
            }
        }
    }
}

// Initialize notification system
window.notificationSystem = new NotificationSystem();

// Load existing notifications
window.notificationSystem.loadNotifications();

// Set up click handlers for notification buttons
document.addEventListener('DOMContentLoaded', () => {
    // Add click handler to notification button in header
    const notificationBtn = document.querySelector('.action-btn[title="Notifications"]');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.notificationSystem.toggleNotificationCenter();
        });
    }

    // Close notification center when clicking outside
    document.addEventListener('click', (e) => {
        const center = document.getElementById('notificationCenter');
        const btn = document.querySelector('.action-btn[title="Notifications"]');
        
        if (center && !center.contains(e.target) && !btn.contains(e.target)) {
            window.notificationSystem.hideNotificationCenter();
        }
    });
});

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            window.notificationSystem.userPreferences.browserNotifications = true;
            window.notificationSystem.saveUserPreferences();
        }
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
}
