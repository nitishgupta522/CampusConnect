// Data Synchronization Module
// Ensures data consistency across all modules

class DataSyncManager {
    constructor() {
        this.dataStore = new Map();
        this.subscribers = new Map();
        this.syncQueue = [];
        this.isOnline = navigator.onLine;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Network status monitoring
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processSyncQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        // Storage change monitoring
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('campus_connect_')) {
                this.handleStorageChange(e.key, e.newValue);
            }
        });
    }

    // Register data store
    registerStore(storeName, initialData = []) {
        this.dataStore.set(storeName, {
            data: initialData,
            lastSync: Date.now(),
            version: 1
        });
    }

    // Subscribe to data changes
    subscribe(storeName, callback) {
        if (!this.subscribers.has(storeName)) {
            this.subscribers.set(storeName, []);
        }
        this.subscribers.get(storeName).push(callback);
    }

    // Unsubscribe from data changes
    unsubscribe(storeName, callback) {
        const subscribers = this.subscribers.get(storeName);
        if (subscribers) {
            const index = subscribers.indexOf(callback);
            if (index > -1) {
                subscribers.splice(index, 1);
            }
        }
    }

    // Get data from store
    getData(storeName) {
        const store = this.dataStore.get(storeName);
        return store ? store.data : [];
    }

    // Set data in store
    setData(storeName, data, source = 'local') {
        const store = this.dataStore.get(storeName);
        if (!store) {
            this.registerStore(storeName, data);
            return;
        }

        store.data = data;
        store.lastSync = Date.now();
        store.version++;

        // Notify subscribers
        this.notifySubscribers(storeName, data);

        // Sync to storage
        this.syncToStorage(storeName, data, source);
    }

    // Add item to store
    addItem(storeName, item) {
        const data = this.getData(storeName);
        const newData = [...data, item];
        this.setData(storeName, newData);
        return item;
    }

    // Update item in store
    updateItem(storeName, itemId, updates) {
        const data = this.getData(storeName);
        const newData = data.map(item => 
            item.id === itemId ? { ...item, ...updates } : item
        );
        this.setData(storeName, newData);
        return newData.find(item => item.id === itemId);
    }

    // Remove item from store
    removeItem(storeName, itemId) {
        const data = this.getData(storeName);
        const newData = data.filter(item => item.id !== itemId);
        this.setData(storeName, newData);
    }

    // Notify subscribers of changes
    notifySubscribers(storeName, data) {
        const subscribers = this.subscribers.get(storeName);
        if (subscribers) {
            subscribers.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in subscriber callback:', error);
                }
            });
        }
    }

    // Sync to localStorage
    syncToStorage(storeName, data, source) {
        try {
            const storageKey = `campus_connect_${storeName}`;
            const storageData = {
                data: data,
                timestamp: Date.now(),
                source: source,
                version: this.dataStore.get(storeName)?.version || 1
            };
            localStorage.setItem(storageKey, JSON.stringify(storageData));
        } catch (error) {
            console.error('Failed to sync to storage:', error);
        }
    }

    // Load from localStorage
    loadFromStorage(storeName) {
        try {
            const storageKey = `campus_connect_${storeName}`;
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const storageData = JSON.parse(stored);
                this.dataStore.set(storeName, {
                    data: storageData.data,
                    lastSync: storageData.timestamp,
                    version: storageData.version
                });
                return storageData.data;
            }
        } catch (error) {
            console.error('Failed to load from storage:', error);
        }
        return [];
    }

    // Handle storage changes from other tabs
    handleStorageChange(key, newValue) {
        const storeName = key.replace('campus_connect_', '');
        if (newValue) {
            try {
                const storageData = JSON.parse(newValue);
                const currentStore = this.dataStore.get(storeName);
                
                // Only update if the version is newer
                if (!currentStore || storageData.version > currentStore.version) {
                    this.setData(storeName, storageData.data, 'storage');
                }
            } catch (error) {
                console.error('Failed to handle storage change:', error);
            }
        }
    }

    // Sync with Firebase (when online)
    async syncWithFirebase(storeName) {
        if (!this.isOnline || typeof DatabaseHelper === 'undefined') {
            return;
        }

        try {
            const store = this.dataStore.get(storeName);
            if (!store) return;

            // Get data from Firebase
            let firebaseData = [];
            switch (storeName) {
                case 'students':
                    firebaseData = await DatabaseHelper.getAllStudents();
                    break;
                case 'assignments':
                    firebaseData = await DatabaseHelper.getAssignments();
                    break;
                case 'fees':
                    // Get fees for current user
                    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                    if (currentUser.id) {
                        firebaseData = await DatabaseHelper.getFeeStatus(currentUser.id);
                    }
                    break;
                case 'results':
                    // Get results for current user
                    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
                    if (user.id) {
                        firebaseData = await DatabaseHelper.getResults(user.id);
                    }
                    break;
            }

            // Merge with local data
            const mergedData = this.mergeData(store.data, firebaseData);
            this.setData(storeName, mergedData, 'firebase');

        } catch (error) {
            console.error('Failed to sync with Firebase:', error);
            if (window.errorHandler) {
                window.errorHandler.handleNetworkError(error);
            }
        }
    }

    // Merge local and remote data
    mergeData(localData, remoteData) {
        const merged = [...localData];
        
        remoteData.forEach(remoteItem => {
            const localIndex = merged.findIndex(item => item.id === remoteItem.id);
            if (localIndex >= 0) {
                // Update existing item
                merged[localIndex] = { ...merged[localIndex], ...remoteItem };
            } else {
                // Add new item
                merged.push(remoteItem);
            }
        });

        return merged;
    }

    // Process sync queue when back online
    async processSyncQueue() {
        if (!this.isOnline) return;

        const queue = [...this.syncQueue];
        this.syncQueue = [];

        for (const syncItem of queue) {
            try {
                await this.syncWithFirebase(syncItem.storeName);
            } catch (error) {
                console.error('Failed to process sync item:', error);
                // Re-queue failed items
                this.syncQueue.push(syncItem);
            }
        }
    }

    // Queue sync operation
    queueSync(storeName) {
        this.syncQueue.push({
            storeName: storeName,
            timestamp: Date.now()
        });
    }

    // Initialize data stores
    initializeStores() {
        // Initialize core stores
        this.registerStore('students', this.loadFromStorage('students'));
        this.registerStore('assignments', this.loadFromStorage('assignments'));
        this.registerStore('fees', this.loadFromStorage('fees'));
        this.registerStore('results', this.loadFromStorage('results'));
        this.registerStore('messages', this.loadFromStorage('messages'));
        this.registerStore('notifications', this.loadFromStorage('notifications'));
        this.registerStore('announcements', this.loadFromStorage('announcements'));

        // Set up automatic syncing
        this.setupAutoSync();
    }

    // Set up automatic syncing
    setupAutoSync() {
        // Sync every 5 minutes when online
        setInterval(() => {
            if (this.isOnline) {
                this.dataStore.forEach((store, storeName) => {
                    this.syncWithFirebase(storeName);
                });
            }
        }, 5 * 60 * 1000);

        // Sync on page visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isOnline) {
                this.dataStore.forEach((store, storeName) => {
                    this.syncWithFirebase(storeName);
                });
            }
        });
    }

    // Get sync status
    getSyncStatus() {
        const status = {};
        this.dataStore.forEach((store, storeName) => {
            status[storeName] = {
                lastSync: new Date(store.lastSync).toLocaleString(),
                version: store.version,
                itemCount: store.data.length
            };
        });
        return status;
    }

    // Force sync all stores
    async forceSyncAll() {
        const promises = [];
        this.dataStore.forEach((store, storeName) => {
            promises.push(this.syncWithFirebase(storeName));
        });
        await Promise.all(promises);
    }
}

// Initialize data sync manager
window.dataSync = new DataSyncManager();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dataSync.initializeStores();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataSyncManager;
}
