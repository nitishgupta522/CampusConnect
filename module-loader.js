// Module Loader System
// Ensures proper loading order and dependency management

class ModuleLoader {
    constructor() {
        this.loadedModules = new Set();
        this.loadingModules = new Set();
        this.moduleDependencies = new Map();
        this.moduleCallbacks = new Map();
        this.initializationOrder = [];
    }

    // Define module dependencies
    defineDependencies() {
        this.moduleDependencies.set('error-handler', []);
        this.moduleDependencies.set('data-sync', ['error-handler']);
        this.moduleDependencies.set('performance-monitor', ['error-handler']);
        this.moduleDependencies.set('api-manager', ['error-handler']);
        this.moduleDependencies.set('security-manager', ['error-handler']);
        this.moduleDependencies.set('notification-manager', ['error-handler']);
        this.moduleDependencies.set('firebase-config', ['error-handler']);
        this.moduleDependencies.set('main', ['error-handler', 'firebase-config', 'data-sync', 'performance-monitor', 'api-manager', 'security-manager', 'notification-manager']);
        this.moduleDependencies.set('module-integration', ['main', 'firebase-config', 'data-sync']);
        this.moduleDependencies.set('assignment-management', ['module-integration', 'firebase-config', 'data-sync']);
        this.moduleDependencies.set('realtime-updates', ['module-integration', 'firebase-config', 'data-sync']);
        this.moduleDependencies.set('demo-data', ['firebase-config', 'data-sync']);
        this.moduleDependencies.set('admin-dashboard', ['module-integration', 'assignment-management']);
    }

    // Load a module with its dependencies
    async loadModule(moduleName, scriptPath) {
        if (this.loadedModules.has(moduleName)) {
            return Promise.resolve();
        }

        if (this.loadingModules.has(moduleName)) {
            // Wait for the module to finish loading
            return new Promise((resolve) => {
                const checkLoaded = () => {
                    if (this.loadedModules.has(moduleName)) {
                        resolve();
                    } else {
                        setTimeout(checkLoaded, 100);
                    }
                };
                checkLoaded();
            });
        }

        this.loadingModules.add(moduleName);

        try {
            // Load dependencies first
            const dependencies = this.moduleDependencies.get(moduleName) || [];
            for (const dep of dependencies) {
                await this.loadModule(dep, this.getScriptPath(dep));
            }

            // Load the module script
            await this.loadScript(scriptPath);
            
            this.loadedModules.add(moduleName);
            this.loadingModules.delete(moduleName);
            this.initializationOrder.push(moduleName);

            console.log(`Module loaded: ${moduleName}`);
            
            // Execute callbacks waiting for this module
            const callbacks = this.moduleCallbacks.get(moduleName) || [];
            callbacks.forEach(callback => callback());
            this.moduleCallbacks.delete(moduleName);

        } catch (error) {
            this.loadingModules.delete(moduleName);
            if (window.errorHandler) {
                window.errorHandler.handleError({
                    type: 'module',
                    message: `Failed to load module: ${moduleName}`,
                    error: error
                });
            }
            throw error;
        }
    }

    // Load script dynamically
    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if script already exists
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = (error) => {
                console.warn(`Script ${src} failed to load, continuing without it`);
                resolve(); // Continue even if script fails to load
            };
            document.head.appendChild(script);
        });
    }

    // Get script path for module
    getScriptPath(moduleName) {
        const scriptPaths = {
            'error-handler': 'error-handler.js',
            'data-sync': 'data-sync.js',
            'performance-monitor': 'performance-monitor.js',
            'api-manager': 'api-manager.js',
            'security-manager': 'security-manager.js',
            'notification-manager': 'notification-manager.js',
            'firebase-config': 'firebase-config.js',
            'main': 'main.js',
            'module-integration': 'module-integration.js',
            'assignment-management': 'assignment-management.js',
            'realtime-updates': 'realtime-updates.js',
            'demo-data': 'demo-data.js',
            'admin-dashboard': 'admin-dashboard.js'
        };
        return scriptPaths[moduleName] || `${moduleName}.js`;
    }

    // Wait for module to be loaded
    waitForModule(moduleName) {
        if (this.loadedModules.has(moduleName)) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            const callbacks = this.moduleCallbacks.get(moduleName) || [];
            callbacks.push(resolve);
            this.moduleCallbacks.set(moduleName, callbacks);
        });
    }

    // Initialize modules in correct order
    async initializeModules(requiredModules = []) {
        this.defineDependencies();

        // Determine which modules to load based on current page
        const pageModules = this.getPageModules();
        const modulesToLoad = [...new Set([...requiredModules, ...pageModules])];

        console.log('Loading modules:', modulesToLoad);

        // Load modules in dependency order
        for (const module of modulesToLoad) {
            try {
                await this.loadModule(module, this.getScriptPath(module));
            } catch (error) {
                console.error(`Failed to load module ${module}:`, error);
            }
        }

        // Initialize modules after all are loaded
        await this.initializeLoadedModules();
    }

    // Get modules required for current page
    getPageModules() {
        const path = window.location.pathname;
        const baseModules = ['error-handler', 'data-sync', 'performance-monitor', 'api-manager', 'security-manager', 'notification-manager', 'firebase-config', 'main'];

        if (path.includes('admin-dashboard')) {
            return [...baseModules, 'module-integration', 'admin-dashboard'];
        } else if (path.includes('student-dashboard')) {
            return [...baseModules, 'module-integration', 'assignment-management', 'realtime-updates', 'demo-data'];
        } else if (path.includes('faculty-dashboard')) {
            return [...baseModules, 'module-integration', 'assignment-management', 'realtime-updates', 'demo-data'];
        } else if (path.includes('parent-dashboard')) {
            return [...baseModules, 'module-integration', 'realtime-updates', 'demo-data'];
        } else {
            return baseModules;
        }
    }

    // Initialize loaded modules
    async initializeLoadedModules() {
        console.log('Initializing modules in order:', this.initializationOrder);

        // Initialize modules in the order they were loaded
        for (const moduleName of this.initializationOrder) {
            try {
                await this.initializeModule(moduleName);
            } catch (error) {
                console.error(`Failed to initialize module ${moduleName}:`, error);
            }
        }

        console.log('All modules initialized successfully');
    }

    // Initialize specific module
    async initializeModule(moduleName) {
        switch (moduleName) {
            case 'error-handler':
                // Already initialized when script loads
                break;
            case 'data-sync':
                // DataSyncManager initializes itself
                break;
            case 'performance-monitor':
                // PerformanceMonitor initializes itself
                break;
            case 'api-manager':
                // APIManager initializes itself
                break;
            case 'security-manager':
                // SecurityManager initializes itself
                break;
            case 'notification-manager':
                // NotificationManager initializes itself
                break;
            case 'firebase-config':
                // Already initialized when script loads
                break;
            case 'main':
                // Main.js initializes itself
                break;
            case 'module-integration':
                if (typeof ModuleIntegration !== 'undefined') {
                    ModuleIntegration.init();
                }
                break;
            case 'assignment-management':
                // AssignmentManager initializes itself
                break;
            case 'realtime-updates':
                // RealtimeUpdatesManager initializes itself
                break;
            case 'demo-data':
                // DemoDataManager initializes itself
                break;
            case 'admin-dashboard':
                // AdminDashboard initializes itself
                break;
        }
    }

    // Check if all required modules are loaded
    areModulesReady(moduleNames) {
        return moduleNames.every(name => this.loadedModules.has(name));
    }

    // Get loading status
    getLoadingStatus() {
        return {
            loaded: Array.from(this.loadedModules),
            loading: Array.from(this.loadingModules),
            order: this.initializationOrder
        };
    }
}

// Initialize module loader
window.moduleLoader = new ModuleLoader();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Wait a bit for all scripts to load
        setTimeout(async () => {
            try {
                await window.moduleLoader.initializeModules();
            } catch (error) {
                console.error('Failed to initialize modules:', error);
                // Don't show error popup on initialization failure
            }
        }, 100);
    } catch (error) {
        console.error('Module loader initialization error:', error);
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModuleLoader;
}
