// Security Manager Module
// Handles authentication, authorization, input validation, and security policies

class SecurityManager {
    constructor() {
        this.currentUser = null;
        this.permissions = new Map();
        this.securityPolicies = new Map();
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.maxLoginAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
        this.loginAttempts = new Map();
        this.sessionTimer = null;
        this.init();
    }

    init() {
        this.loadUserSession();
        this.setupSecurityPolicies();
        this.setupEventListeners();
        this.startSessionTimer();
    }

    setupEventListeners() {
        // Monitor user activity for session management
        document.addEventListener('click', () => this.resetSessionTimer());
        document.addEventListener('keypress', () => this.resetSessionTimer());
        document.addEventListener('scroll', () => this.resetSessionTimer());

        // Monitor page visibility for session management
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseSessionTimer();
            } else {
                this.resumeSessionTimer();
            }
        });

        // Monitor beforeunload for session cleanup
        window.addEventListener('beforeunload', () => {
            this.cleanupSession();
        });
    }

    setupSecurityPolicies() {
        // Define role-based permissions
        this.securityPolicies.set('admin', {
            permissions: [
                'read:students', 'write:students', 'delete:students',
                'read:assignments', 'write:assignments', 'delete:assignments',
                'read:fees', 'write:fees', 'delete:fees',
                'read:results', 'write:results', 'delete:results',
                'read:announcements', 'write:announcements', 'delete:announcements',
                'read:messages', 'write:messages', 'delete:messages',
                'read:reports', 'write:reports', 'delete:reports',
                'read:settings', 'write:settings', 'delete:settings'
            ],
            restrictions: []
        });

        this.securityPolicies.set('faculty', {
            permissions: [
                'read:students', 'write:students',
                'read:assignments', 'write:assignments', 'delete:assignments',
                'read:results', 'write:results',
                'read:announcements', 'write:announcements',
                'read:messages', 'write:messages'
            ],
            restrictions: [
                'delete:students', 'delete:fees', 'delete:results',
                'delete:announcements', 'delete:messages', 'delete:reports',
                'read:settings', 'write:settings', 'delete:settings'
            ]
        });

        this.securityPolicies.set('student', {
            permissions: [
                'read:assignments', 'write:assignments',
                'read:results', 'read:fees',
                'read:announcements', 'read:messages', 'write:messages'
            ],
            restrictions: [
                'delete:assignments', 'delete:results', 'delete:fees',
                'delete:announcements', 'delete:messages',
                'read:students', 'write:students', 'delete:students',
                'read:reports', 'write:reports', 'delete:reports',
                'read:settings', 'write:settings', 'delete:settings'
            ]
        });

        this.securityPolicies.set('parent', {
            permissions: [
                'read:students', 'read:assignments', 'read:results',
                'read:fees', 'read:announcements', 'read:messages', 'write:messages'
            ],
            restrictions: [
                'write:students', 'delete:students',
                'write:assignments', 'delete:assignments',
                'write:results', 'delete:results',
                'write:fees', 'delete:fees',
                'write:announcements', 'delete:announcements',
                'delete:messages', 'read:reports', 'write:reports', 'delete:reports',
                'read:settings', 'write:settings', 'delete:settings'
            ]
        });
    }

    // Authentication methods
    async login(email, password) {
        try {
            // Check if user is locked out
            if (this.isUserLockedOut(email)) {
                throw new Error('Account temporarily locked due to multiple failed login attempts');
            }

            // Validate input
            this.validateEmail(email);
            this.validatePassword(password);

            // Attempt login
            const user = await this.authenticateUser(email, password);
            
            if (user) {
                // Reset login attempts on successful login
                this.loginAttempts.delete(email);
                
                // Set up user session
                await this.setupUserSession(user);
                
                // Log successful login
                this.logSecurityEvent('login_success', { email: email });
                
                return user;
            } else {
                // Record failed login attempt
                this.recordFailedLogin(email);
                this.logSecurityEvent('login_failed', { email: email });
                throw new Error('Invalid email or password');
            }
        } catch (error) {
            this.logSecurityEvent('login_error', { email: email, error: error.message });
            throw error;
        }
    }

    async logout() {
        try {
            if (this.currentUser) {
                this.logSecurityEvent('logout', { userId: this.currentUser.id });
                
                // Clear session data
                this.clearUserSession();
                
                // Redirect to login page
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    async authenticateUser(email, password) {
        // In a real application, this would make an API call
        // For now, we'll use the demo data
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Remove password from returned user object
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        
        return null;
    }

    // Authorization methods
    hasPermission(permission) {
        if (!this.currentUser) {
            return false;
        }

        const userRole = this.currentUser.role;
        const policy = this.securityPolicies.get(userRole);
        
        if (!policy) {
            return false;
        }

        return policy.permissions.includes(permission);
    }

    canAccess(resource, action) {
        const permission = `${action}:${resource}`;
        return this.hasPermission(permission);
    }

    requirePermission(permission) {
        if (!this.hasPermission(permission)) {
            throw new Error(`Access denied: ${permission} permission required`);
        }
    }

    requireRole(roles) {
        if (!this.currentUser) {
            throw new Error('Authentication required');
        }

        const userRole = this.currentUser.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        
        if (!allowedRoles.includes(userRole)) {
            throw new Error(`Access denied: ${userRole} role not allowed`);
        }
    }

    // Input validation
    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            throw new Error('Email is required');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }

        // Check for XSS attempts
        if (this.containsMaliciousContent(email)) {
            throw new Error('Invalid email format');
        }
    }

    validatePassword(password) {
        if (!password || typeof password !== 'string') {
            throw new Error('Password is required');
        }

        if (password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }

        // Check for XSS attempts
        if (this.containsMaliciousContent(password)) {
            throw new Error('Invalid password format');
        }
    }

    validateInput(input, type) {
        if (!input || typeof input !== 'string') {
            throw new Error(`${type} is required`);
        }

        // Check for XSS attempts
        if (this.containsMaliciousContent(input)) {
            throw new Error(`Invalid ${type} format`);
        }

        // Check for SQL injection attempts
        if (this.containsSQLInjection(input)) {
            throw new Error(`Invalid ${type} format`);
        }

        return this.sanitizeInput(input);
    }

    containsMaliciousContent(input) {
        const maliciousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe\b[^>]*>/gi,
            /<object\b[^>]*>/gi,
            /<embed\b[^>]*>/gi,
            /<link\b[^>]*>/gi,
            /<meta\b[^>]*>/gi
        ];

        return maliciousPatterns.some(pattern => pattern.test(input));
    }

    containsSQLInjection(input) {
        const sqlPatterns = [
            /('|(\\')|(;)|(\-\-)|(\s+or\s+)|(\s+and\s+))/gi,
            /(union\s+select)/gi,
            /(drop\s+table)/gi,
            /(delete\s+from)/gi,
            /(insert\s+into)/gi,
            /(update\s+set)/gi
        ];

        return sqlPatterns.some(pattern => pattern.test(input));
    }

    sanitizeInput(input) {
        return input
            .replace(/[<>]/g, '') // Remove angle brackets
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+\s*=/gi, '') // Remove event handlers
            .trim();
    }

    // Session management
    async setupUserSession(user) {
        this.currentUser = user;
        this.permissions = new Map();
        
        // Set up permissions based on user role
        const policy = this.securityPolicies.get(user.role);
        if (policy) {
            policy.permissions.forEach(permission => {
                this.permissions.set(permission, true);
            });
        }

        // Store session data
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('sessionStart', Date.now().toString());
        
        // Start session timer
        this.startSessionTimer();
    }

    loadUserSession() {
        try {
            const userData = localStorage.getItem('currentUser');
            const sessionStart = localStorage.getItem('sessionStart');
            
            if (userData && sessionStart) {
                const user = JSON.parse(userData);
                const startTime = parseInt(sessionStart);
                
                // Check if session is still valid
                if (Date.now() - startTime < this.sessionTimeout) {
                    this.currentUser = user;
                    this.setupPermissions();
                    this.startSessionTimer();
                } else {
                    this.clearUserSession();
                }
            }
        } catch (error) {
            console.error('Error loading user session:', error);
            this.clearUserSession();
        }
    }

    clearUserSession() {
        this.currentUser = null;
        this.permissions.clear();
        this.stopSessionTimer();
        
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionStart');
    }

    setupPermissions() {
        if (!this.currentUser) return;
        
        const policy = this.securityPolicies.get(this.currentUser.role);
        if (policy) {
            policy.permissions.forEach(permission => {
                this.permissions.set(permission, true);
            });
        }
    }

    // Session timer management
    startSessionTimer() {
        this.stopSessionTimer();
        this.sessionTimer = setTimeout(() => {
            this.handleSessionTimeout();
        }, this.sessionTimeout);
    }

    stopSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
    }

    resetSessionTimer() {
        if (this.currentUser) {
            this.startSessionTimer();
        }
    }

    pauseSessionTimer() {
        this.stopSessionTimer();
    }

    resumeSessionTimer() {
        if (this.currentUser) {
            this.startSessionTimer();
        }
    }

    handleSessionTimeout() {
        this.logSecurityEvent('session_timeout', { userId: this.currentUser?.id });
        this.clearUserSession();
        
        // Show timeout message
        if (window.notificationManager) {
            window.notificationManager.showNotification(
                'Session expired. Please log in again.',
                'warning'
            );
        }
        
        // Redirect to login page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }

    cleanupSession() {
        this.stopSessionTimer();
    }

    // Login attempt tracking
    recordFailedLogin(email) {
        const attempts = this.loginAttempts.get(email) || 0;
        this.loginAttempts.set(email, attempts + 1);
        
        if (attempts + 1 >= this.maxLoginAttempts) {
            this.lockoutUser(email);
        }
    }

    isUserLockedOut(email) {
        const lockoutData = this.loginAttempts.get(email);
        if (!lockoutData) return false;
        
        const lockoutTime = lockoutData.lockoutTime;
        if (lockoutTime && Date.now() - lockoutTime < this.lockoutDuration) {
            return true;
        }
        
        return false;
    }

    lockoutUser(email) {
        this.loginAttempts.set(email, {
            attempts: this.maxLoginAttempts,
            lockoutTime: Date.now()
        });
        
        this.logSecurityEvent('account_locked', { email: email });
    }

    // Security logging
    logSecurityEvent(eventType, data) {
        const event = {
            type: eventType,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            data: data
        };
        
        // Store in localStorage for now (in production, send to server)
        const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
        logs.push(event);
        
        // Keep only last 1000 logs
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        localStorage.setItem('securityLogs', JSON.stringify(logs));
        
        // Emit event for other modules
        if (window.ModuleEventBus) {
            window.ModuleEventBus.emit('securityEvent', event);
        }
    }

    // Security utilities
    generateCSRFToken() {
        const token = 'csrf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('csrf_token', token);
        return token;
    }

    validateCSRFToken(token) {
        const storedToken = localStorage.getItem('csrf_token');
        return token === storedToken;
    }

    // Get current user info
    getCurrentUser() {
        return this.currentUser;
    }

    getCurrentUserRole() {
        return this.currentUser?.role;
    }

    getCurrentUserPermissions() {
        return Array.from(this.permissions.keys());
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Get security status
    getSecurityStatus() {
        return {
            isAuthenticated: this.isAuthenticated(),
            currentUser: this.currentUser,
            permissions: this.getCurrentUserPermissions(),
            sessionTimeout: this.sessionTimeout,
            maxLoginAttempts: this.maxLoginAttempts,
            lockoutDuration: this.lockoutDuration
        };
    }

    // Update security policies
    updateSecurityPolicy(role, policy) {
        this.securityPolicies.set(role, policy);
    }

    // Set session timeout
    setSessionTimeout(timeout) {
        this.sessionTimeout = timeout;
        if (this.currentUser) {
            this.startSessionTimer();
        }
    }

    // Set login attempt limits
    setLoginAttemptLimits(maxAttempts, lockoutDuration) {
        this.maxLoginAttempts = maxAttempts;
        this.lockoutDuration = lockoutDuration;
    }
}

// Initialize security manager
window.securityManager = new SecurityManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityManager;
}