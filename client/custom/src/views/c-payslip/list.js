define('custom:views/c-payslip/list', ['views/list'], function (Dep) {

    return Dep.extend({

        template: 'custom:c-payslip/list',

        events: {
            'click .tabs-btn': 'actionSelectMonth',
            'click [data-action="showModal"]': 'actionShowModal',
            'click [data-action="downloadPayslip"]': 'actionDownloadPayslip',
            'change #employeeFilter': 'actionEmployeeFilter'

        },

        setup: function () {
            Dep.prototype.setup.call(this);

            Handlebars.registerHelper('ifCond', function (v1, v2, options) {
                if (v1 == v2) {
                    return options.fn(this);
                }
                return options.inverse(this);
            });

            this.selectedPayslip = null;
            this.formattedMonths = [];

            // Employee filter
            this.employeeList = [];
            this.selectedEmployee = '';

            this.applySecurityFilter();

            // Load employee list if admin
            if (this.getUser().isAdmin()) {
                this.loadEmployees();
            }

            // 🔥 IMPORTANT: Listen when collection loads
            this.listenTo(this.collection, 'sync', this.prepareMonths.bind(this));


        },
        loadEmployees: function () {

            let self = this;

            Espo.Ajax.getRequest('CEmployee', {
                maxSize: 200,
                orderBy: 'name',
                order: 'asc'
            }).then(function (response) {

                console.log('Employee List:', response);

                self.employeeList = response.list.map(function (emp) {
                    return {
                        id: emp.id,
                        name: emp.name
                    };
                });

                self.reRender();
            });

        },
        actionEmployeeFilter: function (e) {

            let employeeId = $(e.currentTarget).val();

            console.log('Selected Employee:', employeeId);

            this.selectedEmployee = employeeId;

            if (!employeeId) {
                delete this.collection.where;
            } else {
                this.collection.where = [{
                    type: 'equals',
                    attribute: 'employeeId',
                    value: employeeId
                }];
            }

            this.collection.fetch();
        },

        actionShowModal: function () {

            console.log('Modal function triggered');
            console.log('Selected Payslip:', this.selectedPayslip.attributes);
            if (!this.selectedPayslip) {
                alert('No payslip selected');
                return;
            }

            let self = this;
            let employeeId = this.selectedPayslip.get('employeeId');
            let payPackageId = this.selectedPayslip.get('payPackageId');
            let payslipMonth = this.selectedPayslip.get('month');
            console.log('Employee ID:', employeeId);
            console.log('Pay Package ID:', payPackageId);
            console.log('Payslip Month:', payslipMonth);
            if (!employeeId) {
                alert('Employee not linked');
                return;
            }

            // ===============================
            // Loan Variables
            // ===============================

            let loanEMI = 0;
            let loanTypeName = '';

            let loadEmployee = function () {
                // 🔥 Fetch Employee Model
                self.getModelFactory().create('CEmployee', function (employee) {

                    employee.id = employeeId;

                    employee.fetch().then(function () {

                        // ===== EMPLOYEE BASIC =====
                        let empName = employee.get('name') || '';
                        let empNo = employee.get('id') || '';
                        let designation = employee.get('workRoleName') || '';
                        let department = employee.get('departmentName') || '';
                        let doj = employee.get('createdAt') || '';
                        let location = employee.get('aAddress') || '';
                        let panNumber = employee.get('panCardNumber') || '';


                        let totalMonthDays = new Date(new Date(self.selectedPayslip.get('month')).getFullYear(), new Date(self.selectedPayslip.get('month')).getMonth() + 1, 0).getDate();
                        let totalWorkingDays = self.selectedPayslip.get('totalWorkDays') || 0;
                        self.getModelFactory().create('CPayPackage', function (pkg) {

                            if (payPackageId) {
                                pkg.id = payPackageId;
                            }
                            console.log('Fetching PayPackage for Payslip Modal with ID:', payPackageId);
                            pkg.fetch().then(function () {

                                console.log('PayPackage fetched for Payslip Modal:', pkg.attributes);

                                let basicPay = pkg.get('basicPay') || 0;
                                basicPay = Math.round(basicPay / 12);
                                let conveyanceAllowance = pkg.get('conveyanceAllowance') || 0;
                                conveyanceAllowance = Math.round(conveyanceAllowance / 12);
                                let hra = pkg.get('hRAGross') || 0;
                                hra = Math.round(hra / 12);
                                let medical = pkg.get('medical') || 0;
                                medical = Math.round(medical / 12);
                                let specialAllowance = pkg.get('specialAllowance') || 0;
                                specialAllowance = Math.round(specialAllowance / 12);
                                let balancingFigure = pkg.get('balancingFigure') || 0;
                                balancingFigure = Math.round(balancingFigure / 12);

                                let pTGross = pkg.get('pTGross') || 0;
                                pTGross = Math.round(pTGross / 12);
                                let amountInWords = self.numberToWords(self.selectedPayslip.get('amountCredited') || 0) + ' Rupee Only';
                                let monthText = new Date(payslipMonth).toLocaleString('default', {
                                    month: 'long',
                                    year: 'numeric'
                                });

                                let html = `
                                <style>
                                    body {
                                        font-family: Arial, sans-serif;
                                        color: #333;
                                        background-color: #fff;
                                    }
                                    .modal--container {
                                        width: 100%;
                                        max-width: 800px;
                                        margin: 20px auto;
                                        border: 1px solid #000;
                                        padding: 20px;
                                    }
                                    .modal--header {
                                        border-bottom: 1px solid #000;
                                        padding-bottom: 10px;
                                        margin-bottom: 20px;
                                        display: flex;
                                        justify-content: space-between;
                                        align-items: center;
                                    }

                                    .modal--header img {
                                        width: 200px;
                                        height: auto;
                                    }

                                    .modal--header h2 {
                                        margin: 0;
                                        font-size: 12px;
                                        font-weight: bold;
                                    }

                                    .modal--header p {
                                        margin: 5px 0;
                                        font-size: 12px;
                                    }

                                    .employee-details-header {
                                        text-align: center;
                                        background-color: #f0f0f0;
                                    }

                                    .employee-details {
                                        margin-bottom: 20px;
                                    }

                                    .salary--details--container {
                                        display: flex;
                                        justify-content: space-between;
                                        gap: 2px;
                                        margin-bottom: 5px;
                                    }

                                    .section-title {
                                        font-weight: bold;
                                        margin-bottom: 10px;
                                    }

                                    .table {
                                        width: 100%;
                                        border-collapse: collapse;
                                    }

                                    .table--title {
                                        background-color: #f0f0f0;
                                        font-weight: bold;
                                        text-align: center;
                                        height: 35px;
                                    }

                                    .table td,
                                    .table--header th {
                                        padding: 5px;
                                        border: 1px solid #ccc;
                                        font-size: 14px;
                                    }
                                    .table .value {
                                        font-weight: bold;
                                        width: 200px;
                                    }
                                    .footer {
                                        text-align: center;
                                        font-size: 12px;
                                        color: gray;
                                    }
                                </style>
                                <div class="modal--container">
                                    <div class="modal--header">
                                            <img src="client/img/logo1.png" alt="Company Logo">                                        
                                        <div>
                                            <h2>Ashapura Softech</h2>
                                            <p><b>Address:</b> 1011-12 Satyamev eminance Nr Shukan Mall Science city road Sola, Gujarat, India</p>
                                        </div>
                                    </div>
                                    <div class="employee-details-header">
                                        <h3>Salary Slip For - ${monthText}</h3>
                                        <div class="section-title">Employee Details</div>
                                    </div>

                                    <div class="employee-details">
                                        <table class="table">
                                            <tr>
                                                <td>Employee Name:<span class="value">${empName}</span></td>
                                                <td>Emp No.:<span class="value">${empNo}</span></td>
                                                <td>Designation:<span class="value">${designation}</span></td>
                                                <td>Department:<span class="value">${department}</span></td>
                                            </tr>
                                            <tr>
                                                <td>Date Of Joining: <span class="value">${doj}</span></td>
                                                <td>Location:<span class="value">${location}</span></td>
                                                <td>Total Month Days:<span class="value">${totalMonthDays}</span></td>
                                                <td>PAN Number:<span class="value">${panNumber}</span></td>
                                            </tr>
                                           
                                            <tr>
                                                <td colspan="2">Working Days: <span class="value">${totalWorkingDays}</span></td>
                                                <td colspan="2">Effective Working Days:<span class="value">0</span></td>
                                            </tr>
                                            <tr>
                                                <td>Current LOP: <span class="value">0</span></td>
                                                <td>Previous LOP:<span class="value"> 0</span></td>
                                                <td colspan="2">Duration:<span class="value">31</span></td>
                                            </tr>

                                        </table>
                                    </div>

                                    <div class="salary--details--container">
                                        <table class="table">
                                            <thead>
                                                <tr>
                                                    <th class="table--title" colspan="2">Income</th>
                                                </tr>
                                                <tr class="table--header">
                                                    <th>Components</th>
                                                    <th>Amount </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>Basic Pay:</td>
                                                    <td>${basicPay}</td>
                                                </tr>
                                                <tr>
                                                    <td>Conveyance Allowance:</td>
                                                    <td>${conveyanceAllowance}</td>
                                                </tr>
                                                <tr>
                                                    <td>HRA (Gross):</td>
                                                    <td>${hra}</td>
                                                </tr>
                                                <tr>
                                                    <td>Medical:</td>
                                                    <td>${medical}</td>
                                                </tr>
                                                <tr>
                                                    <td>Special Allowance:</td>
                                                    <td>${specialAllowance}</td>
                                                </tr>
                                                <tr>
                                                    <td>Balancing Figure:</td>
                                                    <td>${balancingFigure}</td>
                                                </tr>
                                                <tr>
                                                    <td>Gross Earning (A):</td>
                                                    <td>₹${(basicPay + conveyanceAllowance + hra + medical + specialAllowance + balancingFigure)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <table class="table">
                                            <thead>
                                                <tr>
                                                    <th class="table--title" colspan="2">Employee Deduction</th>
                                                </tr>
                                                <tr class="table--header">
                                                    <th >Components</th>
                                                    <th>Amount </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>PT (Gross):</td>
                                                    <td>₹${self.selectedPayslip.get('ptGross') || 0}</td>
                                                </tr>

                                                <tr>
                                                    <td>${loanTypeName}</td>
                                                    <td>₹${loanEMI}</td>
                                                </tr>
                                                <tr>
                                                    <td>TDS:</td>
                                                    <td>₹0</td>
                                                </tr>
                                                <tr>
                                                    <td>Total Deductions (B):</td>
                                                    <td>₹${self.selectedPayslip.get('totalDeductions') || 0}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        

                                    </div>
                                        <table class="table">
                                            <tr>
                                                <td><b>Gross Earning:</b> ₹${self.selectedPayslip.get('amountCredited') || 0}</td>
                                                <td><b>Total Deduction:</b> ₹${self.selectedPayslip.get('totalDeductions') || 0}</td>
                                                <td><b>Total Arrear Days:</b> ${self.selectedPayslip.get('arrearDays') || 0}</td>
                                            </tr>
                                            <tr>
                                                <td><b>Net Pay:</b> ₹ ${self.selectedPayslip.get('amountCredited') || 0}</td>
                                                <td colspan="2"><b>Amount in Words:</b> ${amountInWords}</td>
                                            </tr>
                                        </table>
                                    <div class="footer">
                                        <p><b>RO:</b> 1011-12 Satyamev eminance Nr Shukan Mall Science city road Sola Ahmedabad, Gujarat, India</p>
                                        <p><b>Note:</b> This is a Computer Generated Slip and does not require signature.</p>
                                    </div>
                                </div>
                                    <!-- KEEP REST OF YOUR HTML SAME -->
                                </div>
                                `;

                                // ===== CREATE CUSTOM OVERLAY MODAL (Same as hello) =====

                                var backdropId = 'payslipBackdrop-' + Date.now();
                                var modalId = 'payslipModal-' + Date.now();

                                // Remove existing
                                $('div[id^="payslipModal-"], div[id^="payslipBackdrop-"]').remove();

                                // Backdrop
                                var backdropHtml = `
    <div id="${backdropId}" 
         style="position: fixed; top:0; left:0; width:100%; height:100%;
         background-color: rgba(0,0,0,0.5); z-index:9998;">
    </div>
`;

                                // Modal Wrapper (CONTENT NOT CHANGED)
                                var modalHtml = `
    <div id="${modalId}" 
         style="position: fixed; top:50%; left:50%;
         transform: translate(-50%, -50%);
         z-index:9999; width:95%; max-width:900px;
         max-height:90vh; overflow-y:auto;">
         
        <div style="background:#fff; border-radius:4px;
                    box-shadow:0 3px 12px rgba(0,0,0,0.5);">

            <div style="padding:15px; border-bottom:1px solid #ddd;
                        display:flex; justify-content:space-between; align-items:center;">
                <h4 style="margin:0;">Payslip Details</h4>
                <button class="payslipCloseBtn"
                        style="background:none;border:none;font-size:22px;cursor:pointer;">
                    ×
                </button>
            </div>

            <div style="padding:15px;">
                ${html}
            </div>

            <div style="padding:15px; border-top:1px solid #ddd; text-align:right;">
                <button class="payslipCloseBtn btn btn-primary">
                    Close
                </button>
            </div>

        </div>
    </div>
`;

                                // Append to body
                                $(backdropHtml).appendTo('body');
                                $(modalHtml).appendTo('body');

                                // Close Function
                                $(document).on('click', '.payslipCloseBtn', function (e) {
                                    e.preventDefault();
                                    $('div[id^="payslipModal-"], div[id^="payslipBackdrop-"]')
                                        .fadeOut(300, function () {
                                            $(this).remove();
                                        });

                                    $(document).off('click', '.payslipCloseBtn');
                                    $(document).off('click', '#' + backdropId);
                                });

                                // Close on backdrop click
                                $(document).on('click', '#' + backdropId, function (e) {
                                    if (e.target.id === backdropId) {
                                        $('div[id^="payslipModal-"], div[id^="payslipBackdrop-"]')
                                            .fadeOut(300, function () {
                                                $(this).remove();
                                            });

                                        $(document).off('click', '.payslipCloseBtn');
                                        $(document).off('click', '#' + backdropId);
                                    }
                                });

                            });
                        });

                    });

                });
            }

            // ===============================
            // Fetch Loan EMI for that Month
            // ===============================

            let loanId = this.selectedPayslip.get('loanId');
            console.log('Loan ID:', loanId);
            Espo.Ajax.getRequest('CTransactionTimeline', {
                where: [
                    {
                        type: 'equals',
                        attribute: 'loanId',
                        value: loanId
                    },
                    {
                        type: 'equals',
                        attribute: 'month',
                        value: payslipMonth
                    }
                ],
                maxSize: 1
            }).then(function (timelineRes) {

                if (timelineRes.list && timelineRes.list.length > 0) {

                    loanEMI = timelineRes.list[0].amount || 0;
                    let loanId = timelineRes.list[0].loanId;

                    Espo.Ajax.getRequest('CLoan/' + loanId).then(function (loanRes) {

                        loanTypeName = loanRes.type || 'Loan EMI';
                        loadEmployee();

                    });

                } else {
                    loadEmployee();
                }

            });


        },

        numberToWords: function (num) {

            const a = [
                '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
                'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen',
                'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen',
                'Eighteen', 'Nineteen'
            ];

            const b = [
                '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
                'Sixty', 'Seventy', 'Eighty', 'Ninety'
            ];

            if (num === 0) return 'Zero';

            if (num < 20) return a[num];

            if (num < 100)
                return b[Math.floor(num / 10)] + ' ' + a[num % 10];

            if (num < 1000)
                return a[Math.floor(num / 100)] + ' Hundred ' +
                    (num % 100 !== 0 ? this.numberToWords(num % 100) : '');

            if (num < 100000)
                return this.numberToWords(Math.floor(num / 1000)) + ' Thousand ' +
                    (num % 1000 !== 0 ? this.numberToWords(num % 1000) : '');

            if (num < 10000000)
                return this.numberToWords(Math.floor(num / 100000)) + ' Lakh ' +
                    (num % 100000 !== 0 ? this.numberToWords(num % 100000) : '');

            return this.numberToWords(Math.floor(num / 10000000)) + ' Crore ' +
                (num % 10000000 !== 0 ? this.numberToWords(num % 10000000) : '');
        },

        actionDownloadPayslip: function () {

            if (!this.selectedPayslip) {
                alert('No payslip selected');
                return;
            }

            let self = this;

            let employeeId = this.selectedPayslip.get('employeeId');
            let payPackageId = this.selectedPayslip.get('payPackageId');

            if (!employeeId) {
                alert('Employee not linked');
                return;
            }

            this.getModelFactory().create('CEmployee', function (employee) {

                employee.id = employeeId;

                employee.fetch().then(function () {

                    let empName = employee.get('name') || '';
                    let empNo = employee.get('id') || '';
                    let designation = employee.get('workRoleName') || '';
                    let department = employee.get('departmentName') || '';
                    let doj = employee.get('createdAt') || '';
                    let location = employee.get('aAddress') || '';
                    let panNumber = employee.get('panCardNumber') || '';

                    let totalMonthDays = new Date(
                        new Date(self.selectedPayslip.get('month')).getFullYear(),
                        new Date(self.selectedPayslip.get('month')).getMonth() + 1,
                        0
                    ).getDate();

                    let totalWorkingDays = self.selectedPayslip.get('totalWorkDays') || 0;

                    self.getModelFactory().create('CPayPackage', function (pkg) {

                        if (payPackageId) {
                            pkg.id = payPackageId;
                        }

                        pkg.fetch().then(function () {

                            let basicPay = Math.round((pkg.get('basicPay') || 0) / 12);
                            let conveyanceAllowance = Math.round((pkg.get('conveyanceAllowance') || 0) / 12);
                            let hra = Math.round((pkg.get('hRAGross') || 0) / 12);
                            let medical = Math.round((pkg.get('medical') || 0) / 12);
                            let specialAllowance = Math.round((pkg.get('specialAllowance') || 0) / 12);
                            let balancingFigure = Math.round((pkg.get('balancingFigure') || 0) / 12);
                            let pTGross = Math.round((pkg.get('pTGross') || 0) / 12);

                            let amountInWords = self.numberToWords(
                                self.selectedPayslip.get('amountCredited') || 0
                            ) + ' Rupee Only';

                            // 🔥 SAME HTML AS YOUR MODAL (NO OVERLAY WRAPPER)
                            let html = `
                                <style>
                                    body {
                                        font-family: Arial, sans-serif;
                                        color: #333;
                                        background-color: #fff;
                                    }
                                    .modal--container {
                                        width: 100%;
                                        max-width: 800px;
                                        margin: 20px auto;
                                        border: 1px solid #000;
                                        padding: 20px;
                                    }
                                    .modal--header {
                                        border-bottom: 1px solid #000;
                                        padding-bottom: 10px;
                                        margin-bottom: 20px;
                                        display: flex;
                                        justify-content: space-between;
                                        align-items: center;
                                    }

                                    .modal--header img {
                                        width: 200px;
                                        height: auto;
                                    }

                                    .modal--header h2 {
                                        margin: 0;
                                        font-size: 12px;
                                        font-weight: bold;
                                    }

                                    .modal--header p {
                                        margin: 5px 0;
                                        font-size: 12px;
                                    }

                                    .employee-details-header {
                                        text-align: center;
                                        background-color: #f0f0f0;
                                    }

                                    .employee-details {
                                        margin-bottom: 20px;
                                    }

                                    .salary--details--container {
                                        display: flex;
                                        justify-content: space-between;
                                        gap: 2px;
                                        margin-bottom: 5px;
                                    }

                                    .section-title {
                                        font-weight: bold;
                                        margin-bottom: 10px;
                                    }

                                    .table {
                                        width: 100%;
                                        border-collapse: collapse;
                                    }

                                    .table--title {
                                        background-color: #f0f0f0;
                                        font-weight: bold;
                                        text-align: center;
                                        height: 35px;
                                    }

                                    .table td,
                                    .table--header th {
                                        padding: 5px;
                                        border: 1px solid #ccc;
                                        font-size: 14px;
                                    }
                                    .table .value {
                                        font-weight: bold;
                                        width: 200px;
                                    }
                                    .footer {
                                        text-align: center;
                                        font-size: 12px;
                                        color: gray;
                                    }
                                </style>
                                <div class="modal--container">
                                    <div class="modal--header">
                                            <img src="client/img/logo1.png" alt="Company Logo">     
                                        <div>
                                            <h2>Ashapura Softech</h2>
                                            <p><b>Address:</b> 1011-12 Satyamev eminance Nr Shukan Mall Science city road Sola, Gujarat, India</p>
                                        </div>
                                    </div>
                                    <div class="employee-details-header">
                                        <h3>Salary Slip For - January 2026</h3>
                                        <div class="section-title">Employee Details</div>
                                    </div>

                                    <div class="employee-details">
                                        <table class="table">
                                            <tr>
                                                <td>Employee Name:<span class="value">${empName}</span></span></td>
                                                <td>Emp No.:<span class="value">${empNo}</span></td>
                                                <td>Designation:<span class="value">${designation}</span></td>
                                                <td>Department:<span class="value">${department}</span></td>
                                            </tr>
                                            <tr>
                                                <td>Date Of Joining: <span class="value">${doj}</span></td>
                                                <td>Location:<span class="value">${location}</span></td>
                                                <td>Total Month Days:<span class="value">${totalMonthDays}</span></td>
                                                <td>Business Unit:<span class="value">NULL</span></td>
                                            </tr>
                                            <tr>
                                                <td>PF Number: <span class="value">NULL</span></td>
                                                <td>ESIC Number:<span class="value"> NULL</span></td>
                                                <td>UAN Number:<span class="value">NULL</span></td>
                                                <td>PAN Number:<span class="value">${panNumber}</span></td>
                                            </tr>
                                            <tr>
                                                <td>Working Days: <span class="value">${totalWorkingDays}</span></td>
                                                <td>Effective Working Days:<span class="value">0</span></td>
                                                <td>Total Arrear Days:<span class="value">0</span></td>
                                                <td><span class="value"></span></td>
                                            </tr>
                                            <tr>
                                                <td>Current LOP: <span class="value">0</span></td>
                                                <td>Previous LOP:<span class="value"> 0</span></td>
                                                <td>Duration:<span class="value">31</span></td>
                                                <td><span class="value"></span></td>
                                            </tr>

                                        </table>
                                    </div>

                                    <div class="salary--details--container">
                                        <table class="table">
                                            <thead>
                                                <tr>
                                                    <th class="table--title" colspan="2">Income</th>
                                                </tr>
                                                <tr class="table--header">
                                                    <th class="label">Components</th>
                                                    <th class="label">Amount </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>Basic Pay:</td>
                                                    <td>${basicPay}</td>
                                                </tr>
                                                <tr>
                                                    <td>Conveyance Allowance:</td>
                                                    <td>${conveyanceAllowance}</td>
                                                </tr>
                                                <tr>
                                                    <td>HRA (Gross):</td>
                                                    <td>${hra}</td>
                                                </tr>
                                                <tr>
                                                    <td>Medical:</td>
                                                    <td>${medical}</td>
                                                </tr>
                                                <tr>
                                                    <td>Special Allowance:</td>
                                                    <td>${specialAllowance}</td>
                                                </tr>
                                                <tr>
                                                    <td>Balancing Figure:</td>
                                                    <td>${balancingFigure}</td>
                                                </tr>
                                                <tr>
                                                    <td>Gross Earning (A):</td>
                                                    <td>${(basicPay + conveyanceAllowance + hra + medical + specialAllowance + balancingFigure) - pTGross}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <table class="table">
                                            <thead>
                                                <tr>
                                                    <th class="table--title" colspan="2">Employee Deduction</th>
                                                </tr>
                                                <tr class="table--header">
                                                    <th class="label">Components</th>
                                                    <th class="label">Amount </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>PT (Gross):</td>
                                                    <td>200</td>
                                                </tr>
                                                <tr>
                                                    <td>TDS:</td>
                                                    <td>0</td>
                                                </tr>
                                                <tr>
                                                    <td>Total Deductions (B):</td>
                                                    <td>₹${self.selectedPayslip.get('totalDeductions') || 0}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <table class="table">
                                            <thead>
                                                <tr>
                                                    <th class="table--title" colspan="2">Net Pay</th>
                                                </tr>
                                                <tr class="table--header">
                                                    <th class="label">Components</th>
                                                    <th class="label">Amount </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            </tbody>
                                        </table>

                                    </div>
                                        <table class="table">
                                            <tr>
                                                <td><b>Gross Earning:</b> ₹${self.selectedPayslip.get('amountCredited') || 0}</td>
                                                <td><b>Total Deduction:</b> ₹${self.selectedPayslip.get('totalDeductions') || 0}</td>
                                                <td><b>Total Arrear Days:</b> ${self.selectedPayslip.get('arrearDays') || 0}</td>
                                            </tr>
                                            <tr>
                                                <td ><b>Net Pay:</b> ₹ ${amountInWords}</td>
                                                <td colspan="2"><b>Amount in Words:</b> ${self.selectedPayslip.get('amountInWords') || ''}</td>
                                            </tr>
                                        </table>
                                    <div class="footer">
                                        <p><b>RO:</b> 1011-12 Satyamev eminance Nr Shukan Mall Science city road Sola Ahmedabad, Gujarat, India</p>
                                        <p><b>Note:</b> This is a Computer Generated Slip and does not require signature.</p>
                                    </div>
                                </div>
                                    <!-- KEEP REST OF YOUR HTML SAME -->
                                </div>
                                `;

                            // ===== OPEN NEW WINDOW =====
                            let printWindow = window.open('', '_blank');
                            printWindow.document.open();
                            printWindow.document.write(html);
                            printWindow.document.close();

                            // Wait for content load then print
                            printWindow.onload = function () {
                                printWindow.focus();
                                printWindow.print();
                            };

                        });
                    });
                });

            });

        },
        /*
        ==================================================
        1️⃣ Security Filter
        ==================================================
        */
        applySecurityFilter: function () {

            if (this.getUser().isAdmin()) {
                return;
            }

            let userId = this.getUser().id;

            this.collection.where = [{
                type: 'equals',
                attribute: 'assignedUserId',   // 🔥 Use assignedUserId directly
                value: userId
            }];
        },

        /*
        ==================================================
        2️⃣ Prepare Month Tabs After Data Loaded
        ==================================================
        */
        prepareMonths: function () {

            let models = this.collection.models;

            if (!models.length) {
                this.formattedMonths = [];
                this.selectedPayslip = null;
                this.reRender();
                return;
            }

            // Sort DESC by month
            models.sort(function (a, b) {
                return new Date(b.get('month')) - new Date(a.get('month'));
            });

            this.formattedMonths = models.map(function (model) {

                let date = new Date(model.get('month'));

                return {
                    id: model.id,
                    label: date.toLocaleString('default', {
                        month: 'long',
                        year: 'numeric'
                    })
                };
            });

            // Default latest
            this.selectedPayslip = models[0];

            this.reRender();
        },

        /*
        ==================================================
        3️⃣ Month Click
        ==================================================
        */
        actionSelectMonth: function (e) {

            let id = $(e.currentTarget).data('id');

            this.selectedPayslip = this.collection.get(id);

            this.reRender();
        },

        data: function () {

            return {
                formattedMonths: this.formattedMonths,
                selectedPayslip: this.selectedPayslip,


                employeeList: this.employeeList,
                selectedEmployee: this.selectedEmployee,
                isAdmin: this.getUser().isAdmin()
            };
        }

    });
});