// Performance Monitoring Module
// Tracks and optimizes application performance

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoad: 0,
            moduleLoadTimes: {},
            apiResponseTimes: {},
            memoryUsage: 0,
            renderTimes: {}
        };
        this.observers = new Map();
        this.setupMonitoring();
    }

    setupMonitoring() {
        // Page load time
        window.addEventListener('load', () => {
            this.metrics.pageLoad = performance.now();
            this.logMetric('pageLoad', this.metrics.pageLoad);
        });

        // Memory usage monitoring
        this.monitorMemoryUsage();

        // Module load time tracking
        this.trackModuleLoadTimes();

        // API response time tracking
        this.trackApiResponseTimes();

        // Render time tracking
        this.trackRenderTimes();
    }

    // Track module load times
    trackModuleLoadTimes() {
        const originalLoadModule = window.moduleLoader?.loadModule;
        if (originalLoadModule) {
            window.moduleLoader.loadModule = async (moduleName, scriptPath) => {
                const startTime = performance.now();
                try {
                    await originalLoadModule.call(window.moduleLoader, moduleName, scriptPath);
                    const loadTime = performance.now() - startTime;
                    this.metrics.moduleLoadTimes[moduleName] = loadTime;
                    this.logMetric('moduleLoad', { module: moduleName, time: loadTime });
                } catch (error) {
                    const loadTime = performance.now() - startTime;
                    this.logMetric('moduleLoadError', { module: moduleName, time: loadTime, error: error.message });
                }
            };
        }
    }

    // Track API response times
    trackApiResponseTimes() {
        // Override fetch to track response times
        const originalFetch = window.fetch;
        window.fetch = async (url, options = {}) => {
            const startTime = performance.now();
            try {
                const response = await originalFetch(url, options);
                const responseTime = performance.now() - startTime;
                
                const endpoint = this.extractEndpoint(url);
                this.metrics.apiResponseTimes[endpoint] = responseTime;
                this.logMetric('apiResponse', { endpoint, time: responseTime, status: response.status });
                
                return response;
            } catch (error) {
                const responseTime = performance.now() - startTime;
                const endpoint = this.extractEndpoint(url);
                this.logMetric('apiError', { endpoint, time: responseTime, error: error.message });
                throw error;
            }
        };
    }

    // Track render times
    trackRenderTimes() {
        // Use MutationObserver to track DOM changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    const renderTime = performance.now();
                    const target = mutation.target;
                    const component = this.identifyComponent(target);
                    
                    if (component) {
                        this.metrics.renderTimes[component] = renderTime;
                        this.logMetric('render', { component, time: renderTime });
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        this.observers.set('render', observer);
    }

    // Monitor memory usage
    monitorMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                this.metrics.memoryUsage = performance.memory.usedJSHeapSize;
                this.logMetric('memory', this.metrics.memoryUsage);
            }, 10000); // Every 10 seconds
        }
    }

    // Extract endpoint from URL
    extractEndpoint(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.pathname;
        } catch (e) {
            return url;
        }
    }

    // Identify component from DOM element
    identifyComponent(element) {
        // Look for component identifiers
        if (element.classList) {
            for (const className of element.classList) {
                if (className.includes('student-card') || className.includes('assignment-card')) {
                    return className;
                }
            }
        }
        
        // Check parent elements
        let parent = element.parentElement;
        while (parent && parent !== document.body) {
            if (parent.id) {
                return parent.id;
            }
            parent = parent.parentElement;
        }
        
        return null;
    }

    // Log performance metric
    logMetric(type, data) {
        const metric = {
            type: type,
            timestamp: Date.now(),
            data: data,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        console.log('Performance metric:', metric);

        // Store in localStorage for analysis
        try {
            const existingMetrics = JSON.parse(localStorage.getItem('performanceMetrics') || '[]');
            existingMetrics.push(metric);
            
            // Keep only last 100 metrics
            if (existingMetrics.length > 100) {
                existingMetrics.splice(0, existingMetrics.length - 100);
            }
            
            localStorage.setItem('performanceMetrics', JSON.stringify(existingMetrics));
        } catch (e) {
            console.error('Failed to store performance metric:', e);
        }
    }

    // Measure function execution time
    measureFunction(name, fn) {
        return async (...args) => {
            const startTime = performance.now();
            try {
                const result = await fn(...args);
                const executionTime = performance.now() - startTime;
                this.logMetric('function', { name, time: executionTime, success: true });
                return result;
            } catch (error) {
                const executionTime = performance.now() - startTime;
                this.logMetric('function', { name, time: executionTime, success: false, error: error.message });
                throw error;
            }
        };
    }

    // Measure DOM operation
    measureDOMOperation(name, operation) {
        const startTime = performance.now();
        const result = operation();
        const executionTime = performance.now() - startTime;
        this.logMetric('domOperation', { name, time: executionTime });
        return result;
    }

    // Get performance report
    getPerformanceReport() {
        const report = {
            pageLoad: this.metrics.pageLoad,
            moduleLoadTimes: this.metrics.moduleLoadTimes,
            apiResponseTimes: this.metrics.apiResponseTimes,
            renderTimes: this.metrics.renderTimes,
            memoryUsage: this.metrics.memoryUsage,
            recommendations: this.generateRecommendations()
        };

        return report;
    }

    // Generate performance recommendations
    generateRecommendations() {
        const recommendations = [];

        // Check module load times
        Object.entries(this.metrics.moduleLoadTimes).forEach(([module, time]) => {
            if (time > 1000) {
                recommendations.push({
                    type: 'module',
                    message: `Module ${module} is taking ${time.toFixed(2)}ms to load. Consider lazy loading.`,
                    severity: 'warning'
                });
            }
        });

        // Check API response times
        Object.entries(this.metrics.apiResponseTimes).forEach(([endpoint, time]) => {
            if (time > 2000) {
                recommendations.push({
                    type: 'api',
                    message: `API endpoint ${endpoint} is taking ${time.toFixed(2)}ms to respond. Consider optimization.`,
                    severity: 'warning'
                });
            }
        });

        // Check memory usage
        if (this.metrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
            recommendations.push({
                type: 'memory',
                message: `High memory usage detected: ${(this.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
                severity: 'warning'
            });
        }

        return recommendations;
    }

    // Optimize performance
    optimizePerformance() {
        // Lazy load images
        this.lazyLoadImages();

        // Debounce scroll events
        this.debounceScrollEvents();

        // Optimize DOM queries
        this.optimizeDOMQueries();

        // Enable service worker for caching
        this.enableServiceWorker();
    }

    // Lazy load images
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Debounce scroll events
    debounceScrollEvents() {
        let scrollTimeout;
        const originalScroll = window.onscroll;
        
        window.onscroll = () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (originalScroll) {
                    originalScroll();
                }
            }, 16); // ~60fps
        };
    }

    // Optimize DOM queries
    optimizeDOMQueries() {
        // Cache frequently accessed elements
        const cache = new Map();
        
        const originalQuerySelector = document.querySelector;
        document.querySelector = function(selector) {
            if (cache.has(selector)) {
                return cache.get(selector);
            }
            const element = originalQuerySelector.call(this, selector);
            if (element) {
                cache.set(selector, element);
            }
            return element;
        };
    }

    // Enable service worker for caching
    enableServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }

    // Clean up observers
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }
}

// Initialize performance monitor
window.performanceMonitor = new PerformanceMonitor();

// Auto-optimize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.performanceMonitor.optimizePerformance();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}
