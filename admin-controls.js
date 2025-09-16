// Admin Controls Module
// Comprehensive admin dashboard with QR upload and bank account management

class AdminControlsManager {
    constructor() {
        this.currentAdmin = null;
        this.bankAccounts = [];
        this.qrCodes = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for admin login
        if (window.ModuleEventBus) {
            window.ModuleEventBus.on('adminLogin', (adminData) => {
                this.currentAdmin = adminData;
                this.loadAdminData();
            });
        }
    }

    // Initialize admin controls
    init() {
        this.loadCurrentAdmin();
        this.setupAdminUI();
        this.loadBankAccounts();
        this.loadQRCodes();
    }

    // Load current admin data
    loadCurrentAdmin() {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (user.role === 'admin') {
            this.currentAdmin = user;
        }
    }

    // Setup admin UI
    setupAdminUI() {
        const adminSection = document.getElementById('admin-controls-section');
        if (!adminSection) return;

        adminSection.innerHTML = `
            <div class="admin-controls-container">
                <div class="admin-header">
                    <h2><i class="fas fa-cogs"></i> Admin Controls</h2>
                    <p>Manage school settings, payment methods, and system configuration</p>
                </div>

                <div class="admin-tabs">
                    <button class="tab-btn active" onclick="adminControlsManager.showTab('bank-accounts')">
                        <i class="fas fa-university"></i> Bank Accounts
                    </button>
                    <button class="tab-btn" onclick="adminControlsManager.showTab('qr-codes')">
                        <i class="fas fa-qrcode"></i> QR Codes
                    </button>
                    <button class="tab-btn" onclick="adminControlsManager.showTab('system-settings')">
                        <i class="fas fa-sliders-h"></i> System Settings
                    </button>
                    <button class="tab-btn" onclick="adminControlsManager.showTab('reports')">
                        <i class="fas fa-chart-bar"></i> Reports
                    </button>
                </div>

                <!-- Bank Accounts Tab -->
                <div id="bank-accounts-tab" class="tab-content active">
                    <div class="section-header">
                        <h3><i class="fas fa-university"></i> Bank Account Management</h3>
                        <button class="btn-add" onclick="adminControlsManager.openBankAccountModal()">
                            <i class="fas fa-plus"></i> Add Bank Account
                        </button>
                    </div>
                    
                    <div class="bank-accounts-list" id="bank-accounts-list">
                        <div class="loading">Loading bank accounts...</div>
                    </div>
                </div>

                <!-- QR Codes Tab -->
                <div id="qr-codes-tab" class="tab-content">
                    <div class="section-header">
                        <h3><i class="fas fa-qrcode"></i> QR Code Management</h3>
                        <button class="btn-add" onclick="adminControlsManager.openQRUploadModal()">
                            <i class="fas fa-upload"></i> Upload QR Code
                        </button>
                    </div>
                    
                    <div class="qr-codes-list" id="qr-codes-list">
                        <div class="loading">Loading QR codes...</div>
                    </div>
                </div>

                <!-- System Settings Tab -->
                <div id="system-settings-tab" class="tab-content">
                    <div class="section-header">
                        <h3><i class="fas fa-sliders-h"></i> System Configuration</h3>
                    </div>
                    
                    <div class="settings-grid">
                        <div class="setting-card">
                            <h4>School Information</h4>
                            <div class="setting-form">
                                <div class="form-group">
                                    <label>School Name</label>
                                    <input type="text" id="school-name" value="Campus Connect School">
                                </div>
                                <div class="form-group">
                                    <label>School Address</label>
                                    <textarea id="school-address" rows="3">123 Education Street, Learning City, LC 12345</textarea>
                                </div>
                                <div class="form-group">
                                    <label>Contact Number</label>
                                    <input type="tel" id="school-phone" value="+91-9876543210">
                                </div>
                                <button class="btn-save" onclick="adminControlsManager.saveSchoolInfo()">
                                    <i class="fas fa-save"></i> Save Information
                                </button>
                            </div>
                        </div>

                        <div class="setting-card">
                            <h4>Fee Configuration</h4>
                            <div class="setting-form">
                                <div class="form-group">
                                    <label>Default Fee Amount (₹)</label>
                                    <input type="number" id="default-fee" value="50000">
                                </div>
                                <div class="form-group">
                                    <label>Late Fee Percentage (%)</label>
                                    <input type="number" id="late-fee-percentage" value="5">
                                </div>
                                <div class="form-group">
                                    <label>Payment Due Date (Days)</label>
                                    <input type="number" id="payment-due-days" value="30">
                                </div>
                                <button class="btn-save" onclick="adminControlsManager.saveFeeConfig()">
                                    <i class="fas fa-save"></i> Save Configuration
                                </button>
                            </div>
                        </div>

                        <div class="setting-card">
                            <h4>Attendance Settings</h4>
                            <div class="setting-form">
                                <div class="form-group">
                                    <label>Minimum Attendance Required (%)</label>
                                    <input type="number" id="min-attendance" value="75">
                                </div>
                                <div class="form-group">
                                    <label>Working Days per Month</label>
                                    <input type="number" id="working-days" value="22">
                                </div>
                                <div class="form-group">
                                    <label>Auto-mark Absent After (Hours)</label>
                                    <input type="number" id="auto-absent-hours" value="2">
                                </div>
                                <button class="btn-save" onclick="adminControlsManager.saveAttendanceConfig()">
                                    <i class="fas fa-save"></i> Save Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Reports Tab -->
                <div id="reports-tab" class="tab-content">
                    <div class="section-header">
                        <h3><i class="fas fa-chart-bar"></i> System Reports</h3>
                        <div class="report-actions">
                            <button class="btn-export" onclick="adminControlsManager.exportReport('students')">
                                <i class="fas fa-download"></i> Export Students
                            </button>
                            <button class="btn-export" onclick="adminControlsManager.exportReport('fees')">
                                <i class="fas fa-download"></i> Export Fees
                            </button>
                            <button class="btn-export" onclick="adminControlsManager.exportReport('attendance')">
                                <i class="fas fa-download"></i> Export Attendance
                            </button>
                        </div>
                    </div>
                    
                    <div class="reports-grid">
                        <div class="report-card">
                            <h4>Student Statistics</h4>
                            <div class="report-content" id="student-stats">
                                <div class="loading">Loading statistics...</div>
                            </div>
                        </div>
                        
                        <div class="report-card">
                            <h4>Fee Collection</h4>
                            <div class="report-content" id="fee-stats">
                                <div class="loading">Loading statistics...</div>
                            </div>
                        </div>
                        
                        <div class="report-card">
                            <h4>Attendance Overview</h4>
                            <div class="report-content" id="attendance-stats">
                                <div class="loading">Loading statistics...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.addAdminStyles();
        this.setupModals();
    }

    // Add CSS styles for admin controls
    addAdminStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .admin-controls-container {
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                margin-bottom: 20px;
            }

            .admin-header {
                text-align: center;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 2px solid #f0f0f0;
            }

            .admin-header h2 {
                color: #1e293b;
                margin-bottom: 8px;
            }

            .admin-header p {
                color: #64748b;
                margin: 0;
            }

            .admin-tabs {
                display: flex;
                gap: 10px;
                margin-bottom: 25px;
                border-bottom: 2px solid #f0f0f0;
            }

            .tab-btn {
                padding: 12px 20px;
                border: none;
                background: none;
                cursor: pointer;
                border-bottom: 3px solid transparent;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 500;
                color: #64748b;
            }

            .tab-btn.active {
                color: #3b82f6;
                border-bottom-color: #3b82f6;
            }

            .tab-btn:hover {
                color: #3b82f6;
            }

            .tab-content {
                display: none;
            }

            .tab-content.active {
                display: block;
            }

            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #e2e8f0;
            }

            .section-header h3 {
                color: #374151;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .btn-add, .btn-save, .btn-export {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .btn-add {
                background: #10b981;
                color: white;
            }

            .btn-add:hover {
                background: #059669;
            }

            .btn-save {
                background: #3b82f6;
                color: white;
            }

            .btn-save:hover {
                background: #2563eb;
            }

            .btn-export {
                background: #6b7280;
                color: white;
            }

            .btn-export:hover {
                background: #4b5563;
            }

            .report-actions {
                display: flex;
                gap: 10px;
            }

            .bank-accounts-list, .qr-codes-list {
                display: grid;
                gap: 15px;
            }

            .bank-account-card, .qr-code-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                transition: all 0.3s ease;
            }

            .bank-account-card:hover, .qr-code-card:hover {
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            .account-header, .qr-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }

            .account-name, .qr-name {
                font-weight: 600;
                color: #1e293b;
                font-size: 16px;
            }

            .account-status, .qr-status {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
            }

            .account-status.active, .qr-status.active {
                background: #d1fae5;
                color: #065f46;
            }

            .account-status.inactive, .qr-status.inactive {
                background: #fee2e2;
                color: #991b1b;
            }

            .account-details, .qr-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-bottom: 15px;
            }

            .detail-item {
                display: flex;
                flex-direction: column;
            }

            .detail-label {
                font-size: 12px;
                color: #64748b;
                margin-bottom: 2px;
            }

            .detail-value {
                font-weight: 500;
                color: #1e293b;
            }

            .account-actions, .qr-actions {
                display: flex;
                gap: 8px;
            }

            .btn-edit, .btn-delete, .btn-activate, .btn-deactivate {
                padding: 6px 12px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
                transition: all 0.3s ease;
            }

            .btn-edit {
                background: #3b82f6;
                color: white;
            }

            .btn-delete {
                background: #ef4444;
                color: white;
            }

            .btn-activate {
                background: #10b981;
                color: white;
            }

            .btn-deactivate {
                background: #6b7280;
                color: white;
            }

            .settings-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
            }

            .setting-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
            }

            .setting-card h4 {
                color: #374151;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #e2e8f0;
            }

            .setting-form {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .form-group {
                display: flex;
                flex-direction: column;
            }

            .form-group label {
                font-size: 14px;
                font-weight: 500;
                color: #374151;
                margin-bottom: 5px;
            }

            .form-group input, .form-group textarea {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
                transition: border-color 0.3s ease;
            }

            .form-group input:focus, .form-group textarea:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .reports-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
            }

            .report-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
            }

            .report-card h4 {
                color: #374151;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #e2e8f0;
            }

            .report-content {
                min-height: 150px;
            }

            .stat-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #e2e8f0;
            }

            .stat-item:last-child {
                border-bottom: none;
            }

            .stat-label {
                color: #64748b;
                font-size: 14px;
            }

            .stat-value {
                font-weight: 600;
                color: #1e293b;
            }

            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }

            .modal-content {
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #e2e8f0;
            }

            .modal-header h3 {
                color: #1e293b;
                margin: 0;
            }

            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6b7280;
            }

            .modal-body {
                margin-bottom: 20px;
            }

            .modal-footer {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }

            .btn-cancel {
                padding: 8px 16px;
                border: 1px solid #d1d5db;
                background: white;
                color: #374151;
                border-radius: 6px;
                cursor: pointer;
            }

            .btn-submit {
                padding: 8px 16px;
                border: none;
                background: #3b82f6;
                color: white;
                border-radius: 6px;
                cursor: pointer;
            }

            .file-upload-area {
                border: 2px dashed #d1d5db;
                border-radius: 8px;
                padding: 40px 20px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .file-upload-area:hover {
                border-color: #3b82f6;
                background: #f8fafc;
            }

            .file-upload-area.dragover {
                border-color: #3b82f6;
                background: #eff6ff;
            }

            .upload-icon {
                font-size: 48px;
                color: #9ca3af;
                margin-bottom: 10px;
            }

            .upload-text {
                color: #6b7280;
                margin-bottom: 5px;
            }

            .upload-hint {
                font-size: 12px;
                color: #9ca3af;
            }

            .loading {
                text-align: center;
                padding: 20px;
                color: #6b7280;
            }
        `;
        document.head.appendChild(style);
    }

    // Setup modals
    setupModals() {
        // Bank Account Modal
        const bankModal = document.createElement('div');
        bankModal.id = 'bank-account-modal';
        bankModal.className = 'modal';
        bankModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add Bank Account</h3>
                    <button class="modal-close" onclick="adminControlsManager.closeModal('bank-account-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="bank-account-form">
                        <div class="form-group">
                            <label>Bank Name *</label>
                            <input type="text" id="bank-name" required>
                        </div>
                        <div class="form-group">
                            <label>Account Holder Name *</label>
                            <input type="text" id="account-holder" required>
                        </div>
                        <div class="form-group">
                            <label>Account Number *</label>
                            <input type="text" id="account-number" required>
                        </div>
                        <div class="form-group">
                            <label>IFSC Code *</label>
                            <input type="text" id="ifsc-code" required>
                        </div>
                        <div class="form-group">
                            <label>Branch Name</label>
                            <input type="text" id="branch-name">
                        </div>
                        <div class="form-group">
                            <label>Account Type</label>
                            <select id="account-type">
                                <option value="savings">Savings</option>
                                <option value="current">Current</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Status</label>
                            <select id="account-status">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="adminControlsManager.closeModal('bank-account-modal')">Cancel</button>
                    <button class="btn-submit" onclick="adminControlsManager.saveBankAccount()">Save Account</button>
                </div>
            </div>
        `;

        // QR Upload Modal
        const qrModal = document.createElement('div');
        qrModal.id = 'qr-upload-modal';
        qrModal.className = 'modal';
        qrModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Upload QR Code</h3>
                    <button class="modal-close" onclick="adminControlsManager.closeModal('qr-upload-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="qr-upload-form">
                        <div class="form-group">
                            <label>QR Code Name *</label>
                            <input type="text" id="qr-name" required>
                        </div>
                        <div class="form-group">
                            <label>Payment Method *</label>
                            <select id="payment-method" required>
                                <option value="upi">UPI</option>
                                <option value="wallet">Wallet</option>
                                <option value="card">Card</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>QR Code Image *</label>
                            <div class="file-upload-area" onclick="document.getElementById('qr-image').click()">
                                <div class="upload-icon">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                </div>
                                <div class="upload-text">Click to upload QR code image</div>
                                <div class="upload-hint">PNG, JPG, JPEG up to 5MB</div>
                                <input type="file" id="qr-image" accept="image/*" style="display: none;" onchange="adminControlsManager.handleFileSelect(event)">
                            </div>
                            <div id="file-preview" style="display: none; margin-top: 10px;">
                                <img id="preview-image" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="qr-description" rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Status</label>
                            <select id="qr-status">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="adminControlsManager.closeModal('qr-upload-modal')">Cancel</button>
                    <button class="btn-submit" onclick="adminControlsManager.saveQRCode()">Upload QR Code</button>
                </div>
            </div>
        `;

        document.body.appendChild(bankModal);
        document.body.appendChild(qrModal);
    }

    // Show tab
    showTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(`${tabName}-tab`).classList.add('active');
        event.target.classList.add('active');

        // Load tab data
        switch (tabName) {
            case 'bank-accounts':
                this.loadBankAccounts();
                break;
            case 'qr-codes':
                this.loadQRCodes();
                break;
            case 'reports':
                this.loadReports();
                break;
        }
    }

    // Open bank account modal
    openBankAccountModal() {
        document.getElementById('bank-account-modal').style.display = 'flex';
    }

    // Open QR upload modal
    openQRUploadModal() {
        document.getElementById('qr-upload-modal').style.display = 'flex';
    }

    // Close modal
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    // Handle file select
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('preview-image').src = e.target.result;
                document.getElementById('file-preview').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }

    // Save bank account
    async saveBankAccount() {
        const form = document.getElementById('bank-account-form');
        const formData = new FormData(form);
        
        const bankAccount = {
            id: 'BANK' + Date.now(),
            bankName: document.getElementById('bank-name').value,
            accountHolder: document.getElementById('account-holder').value,
            accountNumber: document.getElementById('account-number').value,
            ifscCode: document.getElementById('ifsc-code').value,
            branchName: document.getElementById('branch-name').value,
            accountType: document.getElementById('account-type').value,
            status: document.getElementById('account-status').value,
            createdAt: new Date().toISOString(),
            createdBy: this.currentAdmin.id
        };

        try {
            // Save to localStorage (in real app, save to database)
            this.bankAccounts.push(bankAccount);
            localStorage.setItem('bank_accounts', JSON.stringify(this.bankAccounts));

            if (window.notificationManager) {
                window.notificationManager.success('Bank account added successfully!');
            }

            this.closeModal('bank-account-modal');
            this.loadBankAccounts();
            form.reset();

        } catch (error) {
            console.error('Error saving bank account:', error);
            if (window.notificationManager) {
                window.notificationManager.error('Failed to save bank account');
            }
        }
    }

    // Save QR code
    async saveQRCode() {
        const form = document.getElementById('qr-upload-form');
        const fileInput = document.getElementById('qr-image');
        
        if (!fileInput.files[0]) {
            if (window.notificationManager) {
                window.notificationManager.warning('Please select a QR code image');
            }
            return;
        }

        const qrCode = {
            id: 'QR' + Date.now(),
            name: document.getElementById('qr-name').value,
            paymentMethod: document.getElementById('payment-method').value,
            description: document.getElementById('qr-description').value,
            status: document.getElementById('qr-status').value,
            imageData: await this.convertFileToBase64(fileInput.files[0]),
            createdAt: new Date().toISOString(),
            createdBy: this.currentAdmin.id
        };

        try {
            // Save to localStorage (in real app, save to database)
            this.qrCodes.push(qrCode);
            localStorage.setItem('qr_codes', JSON.stringify(this.qrCodes));

            if (window.notificationManager) {
                window.notificationManager.success('QR code uploaded successfully!');
            }

            this.closeModal('qr-upload-modal');
            this.loadQRCodes();
            form.reset();
            document.getElementById('file-preview').style.display = 'none';

        } catch (error) {
            console.error('Error saving QR code:', error);
            if (window.notificationManager) {
                window.notificationManager.error('Failed to upload QR code');
            }
        }
    }

    // Convert file to base64
    convertFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // Load bank accounts
    loadBankAccounts() {
        this.bankAccounts = JSON.parse(localStorage.getItem('bank_accounts') || '[]');
        this.updateBankAccountsDisplay();
    }

    // Update bank accounts display
    updateBankAccountsDisplay() {
        const accountsList = document.getElementById('bank-accounts-list');
        if (!accountsList) return;

        if (this.bankAccounts.length === 0) {
            accountsList.innerHTML = '<div class="loading">No bank accounts found</div>';
            return;
        }

        accountsList.innerHTML = this.bankAccounts.map(account => `
            <div class="bank-account-card">
                <div class="account-header">
                    <div class="account-name">${account.bankName}</div>
                    <div class="account-status ${account.status}">${account.status.toUpperCase()}</div>
                </div>
                <div class="account-details">
                    <div class="detail-item">
                        <div class="detail-label">Account Holder</div>
                        <div class="detail-value">${account.accountHolder}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Account Number</div>
                        <div class="detail-value">****${account.accountNumber.slice(-4)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">IFSC Code</div>
                        <div class="detail-value">${account.ifscCode}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Account Type</div>
                        <div class="detail-value">${account.accountType}</div>
                    </div>
                </div>
                <div class="account-actions">
                    <button class="btn-edit" onclick="adminControlsManager.editBankAccount('${account.id}')">Edit</button>
                    <button class="btn-${account.status === 'active' ? 'deactivate' : 'activate'}" 
                            onclick="adminControlsManager.toggleBankAccountStatus('${account.id}')">
                        ${account.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button class="btn-delete" onclick="adminControlsManager.deleteBankAccount('${account.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // Load QR codes
    loadQRCodes() {
        this.qrCodes = JSON.parse(localStorage.getItem('qr_codes') || '[]');
        this.updateQRCodesDisplay();
    }

    // Update QR codes display
    updateQRCodesDisplay() {
        const qrList = document.getElementById('qr-codes-list');
        if (!qrList) return;

        if (this.qrCodes.length === 0) {
            qrList.innerHTML = '<div class="loading">No QR codes found</div>';
            return;
        }

        qrList.innerHTML = this.qrCodes.map(qr => `
            <div class="qr-code-card">
                <div class="qr-header">
                    <div class="qr-name">${qr.name}</div>
                    <div class="qr-status ${qr.status}">${qr.status.toUpperCase()}</div>
                </div>
                <div class="qr-details">
                    <div class="detail-item">
                        <div class="detail-label">Payment Method</div>
                        <div class="detail-value">${qr.paymentMethod.toUpperCase()}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Description</div>
                        <div class="detail-value">${qr.description || 'No description'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Created</div>
                        <div class="detail-value">${this.formatDate(qr.createdAt)}</div>
                    </div>
                </div>
                <div class="qr-image-preview">
                    <img src="${qr.imageData}" alt="QR Code" style="max-width: 100px; max-height: 100px; border-radius: 4px;">
                </div>
                <div class="qr-actions">
                    <button class="btn-edit" onclick="adminControlsManager.editQRCode('${qr.id}')">Edit</button>
                    <button class="btn-${qr.status === 'active' ? 'deactivate' : 'activate'}" 
                            onclick="adminControlsManager.toggleQRCodeStatus('${qr.id}')">
                        ${qr.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button class="btn-delete" onclick="adminControlsManager.deleteQRCode('${qr.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // Load reports
    loadReports() {
        this.loadStudentStats();
        this.loadFeeStats();
        this.loadAttendanceStats();
    }

    // Load student statistics
    loadStudentStats() {
        const students = JSON.parse(localStorage.getItem('registeredStudents') || '[]');
        const faculty = JSON.parse(localStorage.getItem('registeredFaculty') || '[]');
        const parents = JSON.parse(localStorage.getItem('registeredParents') || '[]');

        const stats = {
            totalStudents: students.length,
            totalFaculty: faculty.length,
            totalParents: parents.length,
            activeStudents: students.filter(s => s.status === 'active').length,
            pendingRegistrations: students.filter(s => s.status === 'pending').length
        };

        document.getElementById('student-stats').innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Total Students</span>
                <span class="stat-value">${stats.totalStudents}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Active Students</span>
                <span class="stat-value">${stats.activeStudents}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Faculty</span>
                <span class="stat-value">${stats.totalFaculty}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Parents</span>
                <span class="stat-value">${stats.totalParents}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Pending Registrations</span>
                <span class="stat-value">${stats.pendingRegistrations}</span>
            </div>
        `;
    }

    // Load fee statistics
    loadFeeStats() {
        // Simulate fee statistics
        const stats = {
            totalFees: 1500000,
            collectedFees: 1200000,
            pendingFees: 300000,
            collectionRate: 80
        };

        document.getElementById('fee-stats').innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Total Fees</span>
                <span class="stat-value">₹${stats.totalFees.toLocaleString()}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Collected Fees</span>
                <span class="stat-value">₹${stats.collectedFees.toLocaleString()}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Pending Fees</span>
                <span class="stat-value">₹${stats.pendingFees.toLocaleString()}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Collection Rate</span>
                <span class="stat-value">${stats.collectionRate}%</span>
            </div>
        `;
    }

    // Load attendance statistics
    loadAttendanceStats() {
        // Simulate attendance statistics
        const stats = {
            totalAttendance: 2500,
            presentDays: 2200,
            absentDays: 300,
            attendanceRate: 88
        };

        document.getElementById('attendance-stats').innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Total Attendance</span>
                <span class="stat-value">${stats.totalAttendance}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Present Days</span>
                <span class="stat-value">${stats.presentDays}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Absent Days</span>
                <span class="stat-value">${stats.absentDays}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Attendance Rate</span>
                <span class="stat-value">${stats.attendanceRate}%</span>
            </div>
        `;
    }

    // Export report
    exportReport(type) {
        let data = [];
        let filename = '';

        switch (type) {
            case 'students':
                data = JSON.parse(localStorage.getItem('registeredStudents') || '[]');
                filename = 'students_report.csv';
                break;
            case 'fees':
                data = JSON.parse(localStorage.getItem('fees_data') || '[]');
                filename = 'fees_report.csv';
                break;
            case 'attendance':
                data = JSON.parse(localStorage.getItem('attendance_data') || '[]');
                filename = 'attendance_report.csv';
                break;
        }

        if (data.length === 0) {
            if (window.notificationManager) {
                window.notificationManager.warning('No data available to export');
            }
            return;
        }

        this.downloadCSV(data, filename);
    }

    // Download CSV
    downloadCSV(data, filename) {
        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);

        if (window.notificationManager) {
            window.notificationManager.success(`Report exported as ${filename}`);
        }
    }

    // Convert to CSV
    convertToCSV(data) {
        if (!data || !data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        const csvRows = data.map(row => 
            headers.map(header => `"${row[header] || ''}"`).join(',')
        );
        
        return [csvHeaders, ...csvRows].join('\n');
    }

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Toggle bank account status
    toggleBankAccountStatus(accountId) {
        const account = this.bankAccounts.find(a => a.id === accountId);
        if (account) {
            account.status = account.status === 'active' ? 'inactive' : 'active';
            localStorage.setItem('bank_accounts', JSON.stringify(this.bankAccounts));
            this.updateBankAccountsDisplay();
            
            if (window.notificationManager) {
                window.notificationManager.success(`Bank account ${account.status}d successfully`);
            }
        }
    }

    // Toggle QR code status
    toggleQRCodeStatus(qrId) {
        const qr = this.qrCodes.find(q => q.id === qrId);
        if (qr) {
            qr.status = qr.status === 'active' ? 'inactive' : 'active';
            localStorage.setItem('qr_codes', JSON.stringify(this.qrCodes));
            this.updateQRCodesDisplay();
            
            if (window.notificationManager) {
                window.notificationManager.success(`QR code ${qr.status}d successfully`);
            }
        }
    }

    // Delete bank account
    deleteBankAccount(accountId) {
        if (window.notificationManager) {
            window.notificationManager.confirm(
                'Are you sure you want to delete this bank account?',
                () => {
                    this.bankAccounts = this.bankAccounts.filter(a => a.id !== accountId);
                    localStorage.setItem('bank_accounts', JSON.stringify(this.bankAccounts));
                    this.updateBankAccountsDisplay();
                    window.notificationManager.success('Bank account deleted successfully');
                }
            );
        }
    }

    // Delete QR code
    deleteQRCode(qrId) {
        if (window.notificationManager) {
            window.notificationManager.confirm(
                'Are you sure you want to delete this QR code?',
                () => {
                    this.qrCodes = this.qrCodes.filter(q => q.id !== qrId);
                    localStorage.setItem('qr_codes', JSON.stringify(this.qrCodes));
                    this.updateQRCodesDisplay();
                    window.notificationManager.success('QR code deleted successfully');
                }
            );
        }
    }

    // Save school information
    saveSchoolInfo() {
        const schoolInfo = {
            name: document.getElementById('school-name').value,
            address: document.getElementById('school-address').value,
            phone: document.getElementById('school-phone').value
        };

        localStorage.setItem('school_info', JSON.stringify(schoolInfo));
        
        if (window.notificationManager) {
            window.notificationManager.success('School information saved successfully');
        }
    }

    // Save fee configuration
    saveFeeConfig() {
        const feeConfig = {
            defaultFee: document.getElementById('default-fee').value,
            lateFeePercentage: document.getElementById('late-fee-percentage').value,
            paymentDueDays: document.getElementById('payment-due-days').value
        };

        localStorage.setItem('fee_config', JSON.stringify(feeConfig));
        
        if (window.notificationManager) {
            window.notificationManager.success('Fee configuration saved successfully');
        }
    }

    // Save attendance configuration
    saveAttendanceConfig() {
        const attendanceConfig = {
            minAttendance: document.getElementById('min-attendance').value,
            workingDays: document.getElementById('working-days').value,
            autoAbsentHours: document.getElementById('auto-absent-hours').value
        };

        localStorage.setItem('attendance_config', JSON.stringify(attendanceConfig));
        
        if (window.notificationManager) {
            window.notificationManager.success('Attendance configuration saved successfully');
        }
    }
}

// Initialize admin controls manager
window.adminControlsManager = new AdminControlsManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminControlsManager;
}
