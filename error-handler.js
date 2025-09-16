// Global Error Handler Module
// Provides centralized error handling and user feedback

class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.setupGlobalErrorHandlers();
    }

    setupGlobalErrorHandlers() {
        // Global JavaScript error handler
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'promise',
                message: event.reason?.message || 'Unhandled Promise Rejection',
                error: event.reason
            });
        });

        // Module loading error handler
        window.addEventListener('error', (event) => {
            if (event.target.tagName === 'SCRIPT') {
                this.handleError({
                    type: 'script',
                    message: `Failed to load script: ${event.target.src}`,
                    src: event.target.src
                });
            }
        });
    }

    handleError(errorInfo) {
        // Log error
        this.logError(errorInfo);

        // Show user-friendly notification
        this.showUserNotification(errorInfo);

        // Report to monitoring service (if available)
        this.reportError(errorInfo);
    }

    logError(errorInfo) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            user: this.getCurrentUser(),
            ...errorInfo
        };

        this.errorLog.push(errorEntry);
        console.error('Error logged:', errorEntry);

        // Store in localStorage for debugging
        try {
            const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
            existingLogs.push(errorEntry);
            // Keep only last 50 errors
            if (existingLogs.length > 50) {
                existingLogs.splice(0, existingLogs.length - 50);
            }
            localStorage.setItem('errorLogs', JSON.stringify(existingLogs));
        } catch (e) {
            console.error('Failed to store error log:', e);
        }
    }

    showUserNotification(errorInfo) {
        let userMessage = 'An unexpected error occurred. Please try again.';
        
        // Customize message based on error type
        switch (errorInfo.type) {
            case 'network':
                userMessage = 'Network error. Please check your connection and try again.';
                break;
            case 'auth':
                userMessage = 'Authentication error. Please log in again.';
                break;
            case 'validation':
                userMessage = errorInfo.message || 'Please check your input and try again.';
                break;
            case 'permission':
                userMessage = 'You do not have permission to perform this action.';
                break;
        }

        // Show notification
        if (typeof window.notificationManager !== 'undefined') {
            window.notificationManager.error(userMessage);
        } else if (typeof DashboardUtils !== 'undefined' && DashboardUtils.showNotification) {
            DashboardUtils.showNotification(userMessage, 'error');
        } else {
            // Fallback notification
            this.showFallbackNotification(userMessage);
        }
    }

    showFallbackNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            max-width: 300px;
            font-weight: 500;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    reportError(errorInfo) {
        // In production, send to error monitoring service
        // For now, just log to console
        console.log('Error reported:', errorInfo);
    }

    getCurrentUser() {
        try {
            const user = localStorage.getItem('currentUser');
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    }

    // Utility methods for specific error types
    handleNetworkError(error) {
        this.handleError({
            type: 'network',
            message: error.message || 'Network request failed',
            error: error
        });
    }

    handleAuthError(error) {
        this.handleError({
            type: 'auth',
            message: error.message || 'Authentication failed',
            error: error
        });
    }

    handleValidationError(errors) {
        this.handleError({
            type: 'validation',
            message: 'Validation failed',
            errors: errors
        });
    }

    handlePermissionError(action) {
        this.handleError({
            type: 'permission',
            message: `Permission denied for action: ${action}`,
            action: action
        });
    }

    // Method to get error logs for debugging
    getErrorLogs() {
        return this.errorLog;
    }

    // Method to clear error logs
    clearErrorLogs() {
        this.errorLog = [];
        localStorage.removeItem('errorLogs');
    }
}

// Initialize global error handler
window.errorHandler = new ErrorHandler();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}
