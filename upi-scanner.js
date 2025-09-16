// UPI QR Scanner Module
// Handles UPI QR code generation and scanning for fee payments

class UPIScannerManager {
    constructor() {
        this.currentStudent = null;
        this.pendingFees = [];
        this.qrCodeData = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for student login
        if (window.ModuleEventBus) {
            window.ModuleEventBus.on('studentLogin', (studentData) => {
                this.currentStudent = studentData;
                this.loadPendingFees();
            });
        }
    }

    // Initialize UPI scanner
    init() {
        this.loadCurrentStudent();
        this.setupUPIUI();
    }

    // Load current student data
    loadCurrentStudent() {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (user.role === 'student') {
            this.currentStudent = user;
        }
    }

    // Setup UPI UI
    setupUPIUI() {
        const upiSection = document.getElementById('upi-section');
        if (!upiSection) return;

        upiSection.innerHTML = `
            <div class="upi-container">
                <div class="upi-header">
                    <h3><i class="fas fa-qrcode"></i> Pay Fees via UPI</h3>
                    <p>Scan QR code to pay your pending fees instantly</p>
                </div>

                <div class="pending-fees" id="pending-fees">
                    <h4>Pending Fees</h4>
                    <div id="fees-list" class="fees-list">
                        <div class="loading">Loading fees...</div>
                    </div>
                </div>

                <div class="upi-payment" id="upi-payment">
                    <div class="payment-summary">
                        <div class="total-amount">
                            <span class="label">Total Amount:</span>
                            <span class="amount" id="total-amount">₹0</span>
                        </div>
                    </div>

                    <div class="qr-code-container">
                        <div class="qr-code" id="qr-code">
                            <div class="qr-placeholder">
                                <i class="fas fa-qrcode"></i>
                                <p>Select fees to generate QR code</p>
                            </div>
                        </div>
                    </div>

                    <div class="upi-details">
                        <div class="upi-id">
                            <label>UPI ID:</label>
                            <span>school@paytm</span>
                        </div>
                        <div class="merchant-name">
                            <label>Merchant:</label>
                            <span>Campus Connect School</span>
                        </div>
                    </div>

                    <div class="payment-actions">
                        <button id="generate-qr-btn" class="btn-generate-qr" onclick="upiScannerManager.generateQRCode()">
                            <i class="fas fa-qrcode"></i>
                            Generate QR Code
                        </button>
                        <button id="scan-qr-btn" class="btn-scan-qr" onclick="upiScannerManager.openScanner()">
                            <i class="fas fa-camera"></i>
                            Scan QR Code
                        </button>
                    </div>
                </div>

                <div class="payment-history">
                    <h4>Recent Payments</h4>
                    <div id="payment-history" class="payment-list">
                        <div class="loading">Loading payment history...</div>
                    </div>
                </div>
            </div>
        `;

        this.addUPIStyles();
    }

    // Add CSS styles for UPI
    addUPIStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .upi-container {
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                margin-bottom: 20px;
            }

            .upi-header {
                text-align: center;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 2px solid #f0f0f0;
            }

            .upi-header h3 {
                color: #1e293b;
                margin-bottom: 8px;
            }

            .upi-header p {
                color: #64748b;
                margin: 0;
            }

            .pending-fees {
                margin-bottom: 25px;
            }

            .pending-fees h4 {
                margin-bottom: 15px;
                color: #374151;
            }

            .fees-list {
                max-height: 200px;
                overflow-y: auto;
            }

            .fee-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 15px;
                margin-bottom: 8px;
                background: #f9fafb;
                border-radius: 6px;
                border-left: 4px solid #ef4444;
            }

            .fee-item.selected {
                background: #eff6ff;
                border-left-color: #3b82f6;
            }

            .fee-details {
                flex: 1;
            }

            .fee-name {
                font-weight: 600;
                color: #1e293b;
            }

            .fee-description {
                font-size: 12px;
                color: #64748b;
                margin-top: 2px;
            }

            .fee-amount {
                font-weight: 700;
                color: #ef4444;
                margin-right: 10px;
            }

            .fee-checkbox {
                width: 18px;
                height: 18px;
                cursor: pointer;
            }

            .upi-payment {
                background: #f8fafc;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 25px;
            }

            .payment-summary {
                margin-bottom: 20px;
            }

            .total-amount {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: white;
                border-radius: 6px;
                border: 2px solid #e2e8f0;
            }

            .total-amount .label {
                font-weight: 600;
                color: #374151;
            }

            .total-amount .amount {
                font-size: 24px;
                font-weight: 700;
                color: #059669;
            }

            .qr-code-container {
                text-align: center;
                margin-bottom: 20px;
            }

            .qr-code {
                display: inline-block;
                padding: 20px;
                background: white;
                border-radius: 8px;
                border: 2px solid #e2e8f0;
                min-height: 200px;
                min-width: 200px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .qr-placeholder {
                text-align: center;
                color: #9ca3af;
            }

            .qr-placeholder i {
                font-size: 48px;
                margin-bottom: 10px;
            }

            .qr-placeholder p {
                margin: 0;
                font-size: 14px;
            }

            .upi-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-bottom: 20px;
            }

            .upi-details > div {
                padding: 12px;
                background: white;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
            }

            .upi-details label {
                display: block;
                font-size: 12px;
                color: #64748b;
                margin-bottom: 4px;
            }

            .upi-details span {
                font-weight: 600;
                color: #1e293b;
            }

            .payment-actions {
                display: flex;
                gap: 15px;
            }

            .btn-generate-qr, .btn-scan-qr {
                flex: 1;
                padding: 12px 20px;
                border: none;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .btn-generate-qr {
                background: #3b82f6;
                color: white;
            }

            .btn-generate-qr:hover {
                background: #2563eb;
            }

            .btn-scan-qr {
                background: #10b981;
                color: white;
            }

            .btn-scan-qr:hover {
                background: #059669;
            }

            .btn-generate-qr:disabled, .btn-scan-qr:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .payment-history h4 {
                margin-bottom: 15px;
                color: #374151;
            }

            .payment-list {
                max-height: 200px;
                overflow-y: auto;
            }

            .payment-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 15px;
                margin-bottom: 8px;
                background: #f0fdf4;
                border-radius: 6px;
                border-left: 4px solid #10b981;
            }

            .payment-details {
                flex: 1;
            }

            .payment-date {
                font-weight: 600;
                color: #1e293b;
            }

            .payment-description {
                font-size: 12px;
                color: #64748b;
                margin-top: 2px;
            }

            .payment-amount {
                font-weight: 700;
                color: #059669;
            }

            .scanner-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }

            .scanner-content {
                background: white;
                border-radius: 12px;
                padding: 20px;
                max-width: 400px;
                width: 90%;
                text-align: center;
            }

            .scanner-video {
                width: 100%;
                max-width: 300px;
                height: 300px;
                background: #f3f4f6;
                border-radius: 8px;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #6b7280;
            }

            .scanner-actions {
                display: flex;
                gap: 10px;
                justify-content: center;
            }

            .btn-cancel {
                padding: 8px 16px;
                background: #6b7280;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }

    // Load pending fees
    async loadPendingFees() {
        if (!this.currentStudent) return;

        try {
            // Try to get from Firebase first
            if (typeof DatabaseHelper !== 'undefined') {
                const fees = await DatabaseHelper.getFeeStatus(this.currentStudent.id);
                this.pendingFees = fees.filter(fee => fee.status === 'pending');
            } else {
                // Fallback to localStorage
                const allFees = JSON.parse(localStorage.getItem(`fees_${this.currentStudent.id}`) || '[]');
                this.pendingFees = allFees.filter(fee => fee.status === 'pending');
            }

            this.updateFeesDisplay();
        } catch (error) {
            console.error('Error loading pending fees:', error);
            if (window.errorHandler) {
                window.errorHandler.handleError({
                    type: 'data',
                    message: 'Failed to load pending fees',
                    error: error
                });
            }
        }
    }

    // Update fees display
    updateFeesDisplay() {
        const feesList = document.getElementById('fees-list');
        if (!feesList) return;

        if (this.pendingFees.length === 0) {
            feesList.innerHTML = '<div class="loading">No pending fees</div>';
            return;
        }

        feesList.innerHTML = this.pendingFees.map(fee => `
            <div class="fee-item" data-fee-id="${fee.id}">
                <div class="fee-details">
                    <div class="fee-name">${fee.name}</div>
                    <div class="fee-description">${fee.description || 'School Fee'}</div>
                </div>
                <div class="fee-amount">₹${fee.amount}</div>
                <input type="checkbox" class="fee-checkbox" onchange="upiScannerManager.updateSelectedFees()">
            </div>
        `).join('');
    }

    // Update selected fees
    updateSelectedFees() {
        const checkboxes = document.querySelectorAll('.fee-checkbox:checked');
        const totalAmount = Array.from(checkboxes).reduce((sum, checkbox) => {
            const feeItem = checkbox.closest('.fee-item');
            const amount = feeItem.querySelector('.fee-amount').textContent.replace('₹', '');
            return sum + parseFloat(amount);
        }, 0);

        const totalAmountEl = document.getElementById('total-amount');
        if (totalAmountEl) {
            totalAmountEl.textContent = `₹${totalAmount}`;
        }

        // Update fee items styling
        document.querySelectorAll('.fee-item').forEach(item => {
            const checkbox = item.querySelector('.fee-checkbox');
            if (checkbox.checked) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    // Generate QR code
    generateQRCode() {
        const checkboxes = document.querySelectorAll('.fee-checkbox:checked');
        if (checkboxes.length === 0) {
            if (window.notificationManager) {
                window.notificationManager.warning('Please select at least one fee to pay');
            }
            return;
        }

        const selectedFees = Array.from(checkboxes).map(checkbox => {
            const feeItem = checkbox.closest('.fee-item');
            const feeId = feeItem.dataset.feeId;
            const feeName = feeItem.querySelector('.fee-name').textContent;
            const amount = feeItem.querySelector('.fee-amount').textContent.replace('₹', '');
            return { id: feeId, name: feeName, amount: parseFloat(amount) };
        });

        const totalAmount = selectedFees.reduce((sum, fee) => sum + fee.amount, 0);
        
        // Create UPI payment data
        const upiData = {
            payeeAddress: 'school@paytm',
            payeeName: 'Campus Connect School',
            amount: totalAmount,
            currency: 'INR',
            transactionNote: `Fee payment for ${this.currentStudent.fullName || this.currentStudent.username}`,
            merchantId: 'SCHOOL001',
            fees: selectedFees
        };

        this.qrCodeData = upiData;
        this.displayQRCode(upiData);
    }

    // Display QR code
    displayQRCode(upiData) {
        const qrCodeEl = document.getElementById('qr-code');
        if (!qrCodeEl) return;

        // Create UPI URL
        const upiUrl = `upi://pay?pa=${upiData.payeeAddress}&pn=${encodeURIComponent(upiData.payeeName)}&am=${upiData.amount}&cu=${upiData.currency}&tn=${encodeURIComponent(upiData.transactionNote)}`;

        // Generate QR code (using a simple text-based QR for demo)
        qrCodeEl.innerHTML = `
            <div class="qr-code-content">
                <div class="qr-code-image">
                    <div class="qr-pattern">
                        <div class="qr-corner top-left"></div>
                        <div class="qr-corner top-right"></div>
                        <div class="qr-corner bottom-left"></div>
                        <div class="qr-data">${upiData.amount}</div>
                    </div>
                </div>
                <div class="qr-details">
                    <div class="qr-amount">₹${upiData.amount}</div>
                    <div class="qr-merchant">${upiData.payeeName}</div>
                    <div class="qr-note">${upiData.transactionNote}</div>
                </div>
            </div>
        `;

        // Add QR code styles
        const qrStyle = document.createElement('style');
        qrStyle.textContent = `
            .qr-code-content {
                text-align: center;
            }
            
            .qr-code-image {
                margin-bottom: 15px;
            }
            
            .qr-pattern {
                position: relative;
                width: 150px;
                height: 150px;
                background: #000;
                margin: 0 auto;
                border-radius: 8px;
            }
            
            .qr-corner {
                position: absolute;
                width: 30px;
                height: 30px;
                background: #fff;
                border: 3px solid #000;
            }
            
            .qr-corner.top-left {
                top: 10px;
                left: 10px;
            }
            
            .qr-corner.top-right {
                top: 10px;
                right: 10px;
            }
            
            .qr-corner.bottom-left {
                bottom: 10px;
                left: 10px;
            }
            
            .qr-data {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #fff;
                font-size: 12px;
                font-weight: bold;
            }
            
            .qr-details {
                text-align: center;
            }
            
            .qr-amount {
                font-size: 20px;
                font-weight: 700;
                color: #059669;
                margin-bottom: 5px;
            }
            
            .qr-merchant {
                font-size: 14px;
                color: #374151;
                margin-bottom: 3px;
            }
            
            .qr-note {
                font-size: 12px;
                color: #64748b;
            }
        `;
        document.head.appendChild(qrStyle);
    }

    // Open QR scanner
    openScanner() {
        const modal = document.createElement('div');
        modal.className = 'scanner-modal';
        modal.innerHTML = `
            <div class="scanner-content">
                <h3>Scan Payment QR Code</h3>
                <div class="scanner-video">
                    <i class="fas fa-camera"></i>
                    <p>Camera access required for scanning</p>
                </div>
                <div class="scanner-actions">
                    <button class="btn-cancel" onclick="this.closest('.scanner-modal').remove()">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';

        // Simulate scanning (in real app, you'd use camera API)
        setTimeout(() => {
            this.simulateQRScan();
            modal.remove();
        }, 2000);
    }

    // Simulate QR scan
    simulateQRScan() {
        if (window.notificationManager) {
            window.notificationManager.success('QR code scanned successfully! Payment processed.');
        }
        
        // Simulate payment processing
        this.processPayment();
    }

    // Process payment
    async processPayment() {
        if (!this.qrCodeData) return;

        try {
            const paymentRecord = {
                studentId: this.currentStudent.id,
                studentName: this.currentStudent.fullName || this.currentStudent.username,
                amount: this.qrCodeData.amount,
                fees: this.qrCodeData.fees,
                paymentMethod: 'UPI',
                transactionId: 'TXN' + Date.now(),
                status: 'completed',
                timestamp: new Date().toISOString(),
                upiId: this.qrCodeData.payeeAddress
            };

            // Save payment record
            if (typeof DatabaseHelper !== 'undefined') {
                await DatabaseHelper.addFeeRecord(paymentRecord);
            } else {
                // Fallback to localStorage
                const payments = JSON.parse(localStorage.getItem(`payments_${this.currentStudent.id}`) || '[]');
                payments.push(paymentRecord);
                localStorage.setItem(`payments_${this.currentStudent.id}`, JSON.stringify(payments));
            }

            // Update fee status
            this.qrCodeData.fees.forEach(fee => {
                const feeIndex = this.pendingFees.findIndex(f => f.id === fee.id);
                if (feeIndex >= 0) {
                    this.pendingFees[feeIndex].status = 'paid';
                }
            });

            // Remove paid fees from pending list
            this.pendingFees = this.pendingFees.filter(fee => fee.status === 'pending');

            this.updateFeesDisplay();
            this.loadPaymentHistory();

            if (window.notificationManager) {
                window.notificationManager.success(`Payment of ₹${this.qrCodeData.amount} completed successfully!`);
            }

        } catch (error) {
            console.error('Error processing payment:', error);
            if (window.notificationManager) {
                window.notificationManager.error('Payment processing failed. Please try again.');
            }
        }
    }

    // Load payment history
    async loadPaymentHistory() {
        if (!this.currentStudent) return;

        try {
            const payments = JSON.parse(localStorage.getItem(`payments_${this.currentStudent.id}`) || '[]');
            this.updatePaymentHistoryDisplay(payments);
        } catch (error) {
            console.error('Error loading payment history:', error);
        }
    }

    // Update payment history display
    updatePaymentHistoryDisplay(payments) {
        const paymentHistory = document.getElementById('payment-history');
        if (!paymentHistory) return;

        if (payments.length === 0) {
            paymentHistory.innerHTML = '<div class="loading">No payment history found</div>';
            return;
        }

        paymentHistory.innerHTML = payments.slice(0, 5).map(payment => `
            <div class="payment-item">
                <div class="payment-details">
                    <div class="payment-date">${this.formatDate(payment.timestamp)}</div>
                    <div class="payment-description">${payment.fees.map(f => f.name).join(', ')}</div>
                </div>
                <div class="payment-amount">₹${payment.amount}</div>
            </div>
        `).join('');
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
}

// Initialize UPI scanner manager
window.upiScannerManager = new UPIScannerManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UPIScannerManager;
}
