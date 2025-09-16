// Fee Management Module for Admin Dashboard
class FeeManager {
    constructor() {
        this.feeData = [];
        this.students = [];
        this.currentFilter = {
            class: 'all',
            status: 'all',
            search: ''
        };
        this.init();
    }

    init() {
        this.loadFeeData();
        this.loadStudents();
    }

    async loadFeeData() {
        try {
            if (typeof DatabaseHelper !== 'undefined') {
                const snapshot = await db.collection('fees').orderBy('createdAt', 'desc').get();
                this.feeData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else {
                this.feeData = JSON.parse(localStorage.getItem('feeData') || '[]');
            }
        } catch (error) {
            console.error('Error loading fee data:', error);
            this.feeData = [];
        }
    }

    async loadStudents() {
        try {
            if (typeof DatabaseHelper !== 'undefined') {
                this.students = await DatabaseHelper.getAllStudents();
            } else {
                this.students = JSON.parse(localStorage.getItem('registeredStudents') || '[]');
            }
        } catch (error) {
            console.error('Error loading students:', error);
            this.students = [];
        }
    }

    renderFeeInterface() {
        return `
            <div class="fee-management-container">
                <div class="fee-header">
                    <h2><i class="fas fa-rupee-sign"></i> Fee Management</h2>
                    <div class="fee-actions">
                        <button class="btn-primary" onclick="feeManager.openAddFeeModal()">
                            <i class="fas fa-plus"></i> Add Fee Record
                        </button>
                        <button class="btn-secondary" onclick="feeManager.exportFeeData()">
                            <i class="fas fa-download"></i> Export Data
                        </button>
                    </div>
                </div>

                <div class="fee-stats">
                    <div class="stat-card">
                        <div class="stat-value" id="totalFeeAmount">₹0</div>
                        <div class="stat-label">Total Fee Amount</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="collectedAmount">₹0</div>
                        <div class="stat-label">Collected Amount</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="pendingAmount">₹0</div>
                        <div class="stat-label">Pending Amount</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="collectionRate">0%</div>
                        <div class="stat-label">Collection Rate</div>
                    </div>
                </div>

                <div class="fee-table-container">
                    <table class="fee-table" id="feeTable">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Class</th>
                                <th>Fee Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Due Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="feeTableBody">
                            <tr><td colspan="7" class="loading">Loading fee data...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderFeeTable() {
        const tbody = document.getElementById('feeTableBody');
        if (!tbody) return;

        const filteredData = this.getFilteredFeeData();

        if (filteredData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data">No fee records found</td></tr>';
            return;
        }

        tbody.innerHTML = filteredData.map(fee => `
            <tr>
                <td>${fee.studentName || 'N/A'}</td>
                <td>${fee.class || 'N/A'}</td>
                <td>${fee.feeType || 'Tuition'}</td>
                <td>₹${this.formatCurrency(fee.amount)}</td>
                <td>
                    <span class="status-badge ${fee.status}">
                        ${fee.status.toUpperCase()}
                    </span>
                </td>
                <td>${this.formatDate(fee.dueDate)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="feeManager.editFee('${fee.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="feeManager.deleteFee('${fee.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updateFeeStats();
    }

    getFilteredFeeData() {
        let filtered = [...this.feeData];

        if (this.currentFilter.class !== 'all') {
            filtered = filtered.filter(fee => fee.class === this.currentFilter.class);
        }

        if (this.currentFilter.status !== 'all') {
            filtered = filtered.filter(fee => fee.status === this.currentFilter.status);
        }

        if (this.currentFilter.search) {
            const searchTerm = this.currentFilter.search.toLowerCase();
            filtered = filtered.filter(fee => 
                (fee.studentName || '').toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }

    updateFeeStats() {
        const totalAmount = this.feeData.reduce((sum, fee) => sum + (fee.amount || 0), 0);
        const collectedAmount = this.feeData
            .filter(fee => fee.status === 'paid')
            .reduce((sum, fee) => sum + (fee.amount || 0), 0);
        const pendingAmount = totalAmount - collectedAmount;
        const collectionRate = totalAmount > 0 ? Math.round((collectedAmount / totalAmount) * 100) : 0;

        const totalAmountEl = document.getElementById('totalFeeAmount');
        const collectedAmountEl = document.getElementById('collectedAmount');
        const pendingAmountEl = document.getElementById('pendingAmount');
        const collectionRateEl = document.getElementById('collectionRate');

        if (totalAmountEl) totalAmountEl.textContent = `₹${this.formatCurrency(totalAmount)}`;
        if (collectedAmountEl) collectedAmountEl.textContent = `₹${this.formatCurrency(collectedAmount)}`;
        if (pendingAmountEl) pendingAmountEl.textContent = `₹${this.formatCurrency(pendingAmount)}`;
        if (collectionRateEl) collectionRateEl.textContent = `${collectionRate}%`;
    }

    openAddFeeModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content add-fee-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-plus"></i> Add Fee Record</h3>
                    <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="addFeeForm">
                        <div class="form-group">
                            <label>Student *</label>
                            <select id="feeStudent" required>
                                <option value="">Select Student</option>
                                ${this.students.map(student => 
                                    `<option value="${student.id}">${student.name || student.fullName} (${student.class}${student.section})</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Fee Type *</label>
                            <select id="feeType" required>
                                <option value="">Select Fee Type</option>
                                <option value="tuition">Tuition Fee</option>
                                <option value="transport">Transport Fee</option>
                                <option value="library">Library Fee</option>
                                <option value="exam">Exam Fee</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Amount *</label>
                            <input type="number" id="feeAmount" min="0" required>
                        </div>
                        <div class="form-group">
                            <label>Due Date *</label>
                            <input type="date" id="feeDueDate" required>
                        </div>
                        <div class="form-group">
                            <label>Status *</label>
                            <select id="feeStatus" required>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Cancel</button>
                    <button class="btn-primary" onclick="feeManager.submitFee()">Add Fee</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async submitFee() {
        const form = document.getElementById('addFeeForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const studentId = document.getElementById('feeStudent').value;
        const student = this.students.find(s => s.id === studentId);
        
        const feeData = {
            studentId: studentId,
            studentName: student?.name || student?.fullName,
            class: student?.class,
            feeType: document.getElementById('feeType').value,
            amount: parseInt(document.getElementById('feeAmount').value),
            dueDate: document.getElementById('feeDueDate').value,
            status: document.getElementById('feeStatus').value,
            createdAt: new Date().toISOString()
        };

        try {
            let feeId;
            
            if (typeof DatabaseHelper !== 'undefined') {
                feeId = await DatabaseHelper.addFeeRecord(feeData);
            } else {
                feeId = 'FEE' + Date.now().toString().slice(-6);
                feeData.id = feeId;
                
                let fees = JSON.parse(localStorage.getItem('feeData') || '[]');
                fees.push(feeData);
                localStorage.setItem('feeData', JSON.stringify(fees));
            }

            this.feeData.unshift({ id: feeId, ...feeData });
            this.renderFeeTable();

            alert('Fee record added successfully!');
            document.querySelector('.add-fee-modal').parentElement.remove();

        } catch (error) {
            console.error('Error adding fee:', error);
            alert('Error adding fee record. Please try again.');
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN').format(amount);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN');
    }
}

window.feeManager = new FeeManager();
