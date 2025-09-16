// API Manager Module
// Handles all API communications with retry logic, caching, and error handling

class APIManager {
    constructor() {
        this.baseURL = this.getBaseURL();
        this.cache = new Map();
        this.requestQueue = [];
        this.isOnline = navigator.onLine;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Network status monitoring
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processRequestQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    getBaseURL() {
        // In production, this would be your actual API base URL
        return 'https://api.campusconnect.edu';
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const requestId = this.generateRequestId();
        const request = {
            id: requestId,
            endpoint: endpoint,
            options: options,
            timestamp: Date.now(),
            retryCount: 0
        };

        // Add to request queue if offline
        if (!this.isOnline) {
            this.requestQueue.push(request);
            throw new Error('Network offline. Request queued for retry.');
        }

        try {
            const response = await this.executeRequest(request);
            return response;
        } catch (error) {
            if (request.retryCount < this.retryAttempts) {
                return this.retryRequest(request);
            }
            throw error;
        }
    }

    async executeRequest(request) {
        const url = `${this.baseURL}${request.endpoint}`;
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Request-ID': request.id,
                'X-CSRF-Token': this.getCSRFToken()
            },
            ...request.options
        };

        // Add authentication token if available
        const token = this.getAuthToken();
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const startTime = performance.now();
        const response = await fetch(url, options);
        const responseTime = performance.now() - startTime;

        // Log performance metric
        if (window.performanceMonitor) {
            window.performanceMonitor.logMetric('apiResponse', {
                endpoint: request.endpoint,
                time: responseTime,
                status: response.status
            });
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Cache successful responses
        if (request.options.method === 'GET') {
            this.cacheResponse(request.endpoint, data);
        }

        return data;
    }

    async retryRequest(request) {
        request.retryCount++;
        const delay = this.retryDelay * Math.pow(2, request.retryCount - 1);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        try {
            return await this.executeRequest(request);
        } catch (error) {
            if (request.retryCount < this.retryAttempts) {
                return this.retryRequest(request);
            }
            throw error;
        }
    }

    // Process queued requests when back online
    async processRequestQueue() {
        const queue = [...this.requestQueue];
        this.requestQueue = [];

        for (const request of queue) {
            try {
                await this.executeRequest(request);
            } catch (error) {
                console.error('Failed to process queued request:', error);
            }
        }
    }

    // Cache management
    cacheResponse(endpoint, data) {
        const cacheKey = this.getCacheKey(endpoint);
        const cacheEntry = {
            data: data,
            timestamp: Date.now(),
            ttl: this.getCacheTTL(endpoint)
        };
        this.cache.set(cacheKey, cacheEntry);
    }

    getCachedResponse(endpoint) {
        const cacheKey = this.getCacheKey(endpoint);
        const cacheEntry = this.cache.get(cacheKey);
        
        if (cacheEntry && Date.now() - cacheEntry.timestamp < cacheEntry.ttl) {
            return cacheEntry.data;
        }
        
        if (cacheEntry) {
            this.cache.delete(cacheKey);
        }
        
        return null;
    }

    getCacheKey(endpoint) {
        return endpoint.replace(/[^a-zA-Z0-9]/g, '_');
    }

    getCacheTTL(endpoint) {
        // Different TTL for different endpoints
        const ttlMap = {
            '/students': 5 * 60 * 1000, // 5 minutes
            '/assignments': 2 * 60 * 1000, // 2 minutes
            '/fees': 10 * 60 * 1000, // 10 minutes
            '/results': 15 * 60 * 1000, // 15 minutes
            '/announcements': 30 * 60 * 1000 // 30 minutes
        };

        return ttlMap[endpoint] || 5 * 60 * 1000; // Default 5 minutes
    }

    // Specific API methods
    async getStudents(filters = {}) {
        const endpoint = '/students';
        const queryParams = new URLSearchParams(filters).toString();
        const fullEndpoint = queryParams ? `${endpoint}?${queryParams}` : endpoint;

        // Check cache first
        const cached = this.getCachedResponse(fullEndpoint);
        if (cached) {
            return cached;
        }

        return this.request(fullEndpoint);
    }

    async getStudent(id) {
        const endpoint = `/students/${id}`;
        
        // Check cache first
        const cached = this.getCachedResponse(endpoint);
        if (cached) {
            return cached;
        }

        return this.request(endpoint);
    }

    async createStudent(studentData) {
        const endpoint = '/students';
        const response = await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(studentData)
        });

        // Invalidate cache
        this.invalidateCache('/students');
        
        return response;
    }

    async updateStudent(id, studentData) {
        const endpoint = `/students/${id}`;
        const response = await this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(studentData)
        });

        // Invalidate cache
        this.invalidateCache('/students');
        this.invalidateCache(endpoint);
        
        return response;
    }

    async deleteStudent(id) {
        const endpoint = `/students/${id}`;
        const response = await this.request(endpoint, {
            method: 'DELETE'
        });

        // Invalidate cache
        this.invalidateCache('/students');
        this.invalidateCache(endpoint);
        
        return response;
    }

    async getAssignments(filters = {}) {
        const endpoint = '/assignments';
        const queryParams = new URLSearchParams(filters).toString();
        const fullEndpoint = queryParams ? `${endpoint}?${queryParams}` : endpoint;

        // Check cache first
        const cached = this.getCachedResponse(fullEndpoint);
        if (cached) {
            return cached;
        }

        return this.request(fullEndpoint);
    }

    async createAssignment(assignmentData) {
        const endpoint = '/assignments';
        const response = await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(assignmentData)
        });

        // Invalidate cache
        this.invalidateCache('/assignments');
        
        return response;
    }

    async submitAssignment(assignmentId, submissionData) {
        const endpoint = `/assignments/${assignmentId}/submissions`;
        const response = await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(submissionData)
        });

        // Invalidate cache
        this.invalidateCache('/assignments');
        
        return response;
    }

    async getFees(studentId) {
        const endpoint = `/students/${studentId}/fees`;
        
        // Check cache first
        const cached = this.getCachedResponse(endpoint);
        if (cached) {
            return cached;
        }

        return this.request(endpoint);
    }

    async payFee(feeId, paymentData) {
        const endpoint = `/fees/${feeId}/payments`;
        const response = await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });

        // Invalidate cache
        this.invalidateCache('/fees');
        
        return response;
    }

    async getResults(studentId) {
        const endpoint = `/students/${studentId}/results`;
        
        // Check cache first
        const cached = this.getCachedResponse(endpoint);
        if (cached) {
            return cached;
        }

        return this.request(endpoint);
    }

    async getAnnouncements() {
        const endpoint = '/announcements';
        
        // Check cache first
        const cached = this.getCachedResponse(endpoint);
        if (cached) {
            return cached;
        }

        return this.request(endpoint);
    }

    async sendMessage(messageData) {
        const endpoint = '/messages';
        const response = await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(messageData)
        });

        return response;
    }

    async uploadFile(file, endpoint) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await this.request(endpoint, {
            method: 'POST',
            body: formData,
            headers: {
                // Don't set Content-Type for FormData
            }
        });

        return response;
    }

    // Utility methods
    generateRequestId() {
        return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getAuthToken() {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        return user.token || null;
    }

    getCSRFToken() {
        return localStorage.getItem('csrf_token') || '';
    }

    invalidateCache(pattern) {
        if (pattern) {
            // Invalidate specific cache entries
            for (const [key, value] of this.cache.entries()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            // Clear all cache
            this.cache.clear();
        }
    }

    // Batch requests
    async batchRequest(requests) {
        const promises = requests.map(request => 
            this.request(request.endpoint, request.options)
        );

        try {
            const responses = await Promise.allSettled(promises);
            return responses.map((response, index) => ({
                request: requests[index],
                success: response.status === 'fulfilled',
                data: response.status === 'fulfilled' ? response.value : null,
                error: response.status === 'rejected' ? response.reason : null
            }));
        } catch (error) {
            throw new Error('Batch request failed: ' + error.message);
        }
    }

    // Health check
    async healthCheck() {
        try {
            const response = await this.request('/health', { timeout: 5000 });
            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                response: response
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error.message
            };
        }
    }

    // Get API status
    getAPIStatus() {
        return {
            isOnline: this.isOnline,
            baseURL: this.baseURL,
            cacheSize: this.cache.size,
            queuedRequests: this.requestQueue.length,
            retryAttempts: this.retryAttempts
        };
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }

    // Set retry configuration
    setRetryConfig(attempts, delay) {
        this.retryAttempts = attempts;
        this.retryDelay = delay;
    }
}

// Initialize API manager
window.apiManager = new APIManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIManager;
}
