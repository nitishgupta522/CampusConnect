// Notification Manager Module
// Handles all types of notifications and alerts

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 5;
        this.defaultDuration = 5000;
        this.setupContainer();
        this.setupEventListeners();
    }

    setupContainer() {
        // Create notification container if it doesn't exist
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
        this.container = container;
    }

    setupEventListeners() {
        // Listen for custom notification events
        document.addEventListener('showNotification', (event) => {
            this.showNotification(event.detail.message, event.detail.type, event.detail.duration);
        });

        // Listen for module events
        if (window.ModuleEventBus) {
            window.ModuleEventBus.on('notification', (data) => {
                this.showNotification(data.message, data.type, data.duration);
            });
        }
    }

    // Show notification
    showNotification(message, type = 'info', duration = null) {
        const notification = this.createNotification(message, type, duration);
        this.container.appendChild(notification);
        this.notifications.push(notification);

        // Remove oldest notifications if we exceed max
        if (this.notifications.length > this.maxNotifications) {
            const oldest = this.notifications.shift();
            if (oldest.parentElement) {
                oldest.parentElement.removeChild(oldest);
            }
        }

        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto remove
        const removeDuration = duration || this.defaultDuration;
        setTimeout(() => {
            this.removeNotification(notification);
        }, removeDuration);

        return notification;
    }

    // Create notification element
    createNotification(message, type, duration) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = this.getIcon(type);
        const closeButton = duration === 0 ? '' : '<button class="notification-close" onclick="window.notificationManager.removeNotification(this.parentElement.parentElement)"><i class="fas fa-times"></i></button>';
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div class="notification-message">
                    ${message}
                </div>
                ${closeButton}
            </div>
            <div class="notification-progress"></div>
        `;

        // Add styles
        notification.style.cssText = `
            background: ${this.getBackgroundColor(type)};
            color: white;
            padding: 16px;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            pointer-events: auto;
            position: relative;
            overflow: hidden;
        `;

        // Add progress bar animation
        if (duration !== 0) {
            const progress = notification.querySelector('.notification-progress');
            progress.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(255, 255, 255, 0.3);
                width: 100%;
                transform: scaleX(0);
                transform-origin: left;
                transition: transform ${duration || this.defaultDuration}ms linear;
            `;
            
            setTimeout(() => {
                progress.style.transform = 'scaleX(1)';
            }, 100);
        }

        return notification;
    }

    // Get icon for notification type
    getIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle',
            loading: 'spinner fa-spin'
        };
        return icons[type] || 'info-circle';
    }

    // Get background color for notification type
    getBackgroundColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6',
            loading: '#6b7280'
        };
        return colors[type] || '#3b82f6';
    }

    // Remove notification
    removeNotification(notification) {
        if (!notification || !notification.parentElement) return;

        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }

    // Clear all notifications
    clearAll() {
        this.notifications.forEach(notification => {
            this.removeNotification(notification);
        });
    }

    // Show success notification
    success(message, duration = null) {
        return this.showNotification(message, 'success', duration);
    }

    // Show error notification
    error(message, duration = null) {
        return this.showNotification(message, 'error', duration);
    }

    // Show warning notification
    warning(message, duration = null) {
        return this.showNotification(message, 'warning', duration);
    }

    // Show info notification
    info(message, duration = null) {
        return this.showNotification(message, 'info', duration);
    }

    // Show loading notification
    loading(message, duration = 0) {
        return this.showNotification(message, 'loading', duration);
    }

    // Show confirmation dialog
    confirm(message, onConfirm, onCancel = null) {
        const notification = this.createNotification(message, 'info', 0);
        
        // Add confirmation buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            margin-top: 12px;
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        `;

        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = 'Confirm';
        confirmBtn.style.cssText = `
            background: #10b981;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        `;

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.cssText = `
            background: #6b7280;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        `;

        confirmBtn.onclick = () => {
            this.removeNotification(notification);
            if (onConfirm) onConfirm();
        };

        cancelBtn.onclick = () => {
            this.removeNotification(notification);
            if (onCancel) onCancel();
        };

        buttonContainer.appendChild(cancelBtn);
        buttonContainer.appendChild(confirmBtn);
        
        const content = notification.querySelector('.notification-content');
        content.appendChild(buttonContainer);

        this.container.appendChild(notification);
        this.notifications.push(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        return notification;
    }

    // Show toast notification (smaller, shorter duration)
    toast(message, type = 'info') {
        return this.showNotification(message, type, 2000);
    }

    // Show persistent notification (no auto-remove)
    persistent(message, type = 'info') {
        return this.showNotification(message, type, 0);
    }

    // Get notification count
    getCount() {
        return this.notifications.length;
    }

    // Check if notifications are visible
    isVisible() {
        return this.notifications.length > 0;
    }
}

// Initialize notification manager
window.notificationManager = new NotificationManager();

// Add CSS styles for notifications
const style = document.createElement('style');
style.textContent = `
    .notification.show {
        transform: translateX(0) !important;
    }
    
    .notification.hide {
        transform: translateX(100%) !important;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        margin-left: 8px;
    }
    
    .notification-close:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .notification-icon {
        font-size: 18px;
    }
    
    .notification-message {
        flex: 1;
        font-size: 14px;
        line-height: 1.4;
    }
`;

document.head.appendChild(style);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
}
