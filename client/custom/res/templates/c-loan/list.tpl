<style>
    .list {
        margin-top: 20px;
    }

    .payroll-wrapper {
        margin: 12px;
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    /* Header section */
    .payroll-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .payslip-heading {
        font-size: 24px;
        font-weight: bold;
    }

    .tabs-wrapper {
        display: flex;
    }

    .tabs-btn {
        background-color: #f0f0f0;
        border: 1px solid #ccc;
        padding: 10px 20px;
        margin-right: 10px;
        border-radius: 5px;
        cursor: pointer;
    }

    .tabs-btn:hover {
        background-color: #ddd;
    }

    /* Custom styles for dropdown */
    .dropdown--wrapper {
        position: relative;
        display: inline-block;
    }

    .dropdown--toggle {
        background-color: #f0f0f0;
        padding: 10px 20px;
        border: 1px solid #ccc;
        border-radius: 5px;
        cursor: pointer;
        width: 200px;
        text-align: left;
    }



    .dropdown--list {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background-color: white;
        border: 1px solid #ccc;
        border-radius: 5px;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        z-index: 1000;
    }

    .dropdown--list a {
        padding: 10px 15px;
        display: block;
        text-decoration: none;
        color: black;
    }

    .dropdown--list a:hover {
        background-color: #f0f0f0;
    }

    .dropdown--wrapper:hover .dropdown--list {
        display: block;
    }

    /* Details section */
    .details-section {
        margin-top: 20px;
    }

    .detail-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
        font-size: 16px;
    }

    .detail-item label {
        font-weight: bold;
    }

    .detail-item span {
        font-size: 16px;
    }

    /* Footer section */
    .footer-section {
        display: flex;
        justify-content: flex-end;
        margin-top: 30px;
    }

    .view-btn,
    .download-btn {
        padding: 10px 20px;
        margin-left: 10px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        background-color: #007BFF;
        color: white;
        font-size: 16px;
    }

    .view-btn:hover,
    .download-btn:hover {
        background-color: #0056b3;
    }

    .month-tab.active {
        background-color: #007BFF;
        color: white;
    }

    /* Loan Container Styles */
    .loan-container {
        margin-top: 20px;
        padding: 20px;
        border-radius: 5px;
    }

    .loan-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .loan-type-container button {
        background-color: #ddd;
        color: black;
        border-radius: 5px;
        border: none;
        height: 50px;
        width: 150px;
        margin-right: 10px;
        cursor: pointer;
    }

    .loan-type-container button.active {
        background: #1E8CED;
        color: white;
    }

    .loan-date {
        height: 40px;
        width: 200px;
    }

    .detail--section {
        margin-top: 20px;
    }

    .loan-card {
        display: flex;
        justify-content: space-between;
        padding: 20px;
        margin-bottom: 30px;
        border: 1px solid #ddd;
        border-radius: 8px;
    }

    .loan-card h3 {
        margin-top: 0;
    }

    .loan-details {
        width: 40%;
    }

    .transaction-timeline-container {
        width: 60%;
        height: 400px;
        overflow: scroll;
        scrollbar-width: none;
        margin-top: 15px;
    }

    .timeline-item {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
        border-bottom: 1px solid #ccc;

    }

    .sub--details {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .table-success {
        background-color: #d4edda;
    }

    .table-warning {
        background-color: #ffeeba;
        text-decoration: line-through;
    }
</style>

<div class="list-container">
    <div class="list-header clearfix">
        {{{header}}}
    </div>
    <div class="search-container">
        {{{search}}}
    </div>
    <div class="button-container clearfix">
        {{{buttons}}}
    </div>
    <div class="payroll-wrapper">
        <!-- Header Section -->
        <div class="payroll-header">
            <div class="payslip-heading">Loan</div>
            <!-- Dropdown for "Package & Proration" -->
            <div class="dropdown--wrapper">
                <button class="dropdown--toggle" id="dropdownBtn">Package & Proration</button>
                <div class="dropdown--list">
                    <a href="#CPackage">Package & Proration </a>
                    <a href="#CPayslip">Payslip</a>
                    <a href="#taxSheet">Tax sheet</a>
                    <a href="#salaryAdvance">Salary advance</a>
                    <a href="#CLoan">Loan</a>
                    <a href="#extraPayment">Extra payment</a>
                    <a href="#extraDeduction">Extra deduction</a>
                    <a href="#flexibleBenefitPlan">Flexible benefit plan</a>
                    <a href="#itDeclarationSubmission">IT declaration & submission</a>
                    <a href="#incomeTax">Income tax</a>
                    <a href="#form12B">Form 12B</a>
                    <a href="#overtimePayment">Overtime Payment</a>
                    <a href="#annualPayslip">Annual Payslip</a>
                    <a href="#perquisite">Perquisite</a>
                </div>
            </div>
        </div>
        {{#if isAdmin}}

        <div style="margin-bottom:15px; width:300px;">
            <select id="employee-filter" class="form-control">
                <option value="">All Employees</option>
                {{#each employees}}
                <option value="{{id}}">{{name}}</option>
                {{/each}}
            </select>
        </div>

        {{/if}}
        <div class="loan-container">
            <div class="loan-header">
                <div class="loan-type-container">

                    <button class="loan-type-btn {{#if isHomeLoan}}active{{/if}}" data-type="Loan for Home">
                        Loan for Home
                    </button>

                    <button class="loan-type-btn {{#if isPersonalLoan}}active{{/if}}" data-type="Personal Loan">
                        Personal Loan
                    </button>

                    <button class="loan-type-btn {{#if isCarLoan}}active{{/if}}" data-type="Car Loan">
                        Car Loan
                    </button>

                </div>

                <div>
                    <select id="loan-year" class="form-control">

                        {{#each financialYears}}

                        <option value="{{value}}" {{#if selected}}selected{{/if}}>
                            {{label}}
                        </option>

                        {{/each}}

                    </select>
                </div>
            </div>
            <div class="detail--section">
                {{#if loans.length}}
                {{#each loans}}
                <div class="loan-card">
                    <div class="loan-details">
                        <h4>Loan Amount:</h4>
                        <h5> ₹ {{this.loanAmount}}</h5>
                        <table>
                            <tr>
                                <td>Created On</td>
                                <td class="text-right">{{this.createdAt}}</td>
                            </tr>
                            <tr>
                                <td>Amount Pending</td>
                                <td class="text-right">₹ {{this.amountPending}}</td>
                            </tr>
                            <tr>
                                <td>Amount Repaid</td>
                                <td class="text-right">₹ {{this.amountRepaid}}</td>
                            </tr>
                            <tr>
                                <td>Total Repayable</td>
                                <td class="text-right">₹ {{this.totalRepayableAmount}}</td>
                            </tr>
                            <tr>
                                <td>Interest</td>
                                <td class="text-right">₹ {{this.interest}}</td>
                            </tr>
                            <tr>
                                <td>Recovery Start</td>
                                <td class="text-right">{{this.recoveryStartMonth}}</td>
                            </tr>
                            <tr>
                                <td>Recovery End</td>
                                <td class="text-right">{{this.recoveryEndMonth}}</td>
                            </tr>
                            <tr>
                                <td>Number of Installments</td>
                                <td class="text-right">{{this.numberOfInstallments}}</td>
                            </tr>
                            <tr>
                                <td>Current EMI</td>
                                <td class="text-right">₹ {{this.currentEMI}}</td>
                            </tr>
                        </table>
                    </div>
                    <div class="transaction-timeline-container">
                        <h4>Transaction Timeline <i class="fa fa-calendar"></i> </h4>

                        {{#if this.timelines.length}}

                        {{#each this.timelines}}
                        {{#ifNotEqual status 'Pending'}}
                        <div class="timeline-item">
                            <div class="sub--details">
                                <div class="timeline-date">{{monthLabel}}</div>
                                <div class="timeline-date">₹ {{amount}}</div>
                            </div>
                            <div class="timeline-description">
                                {{status}}
                            </div>
                        </div>
                        {{/ifNotEqual}}
                        {{/each}}
                        {{else}}
                        <p>No transactions found.</p>
                        {{/if}}
                    </div>
                </div>
                <div class="panel panel-default">
                    <div class="panel-heading">
                        <h4 class="panel-title">EMI Schedule</h4>
                    </div>

                    <div class="panel-body">

                        <table class="table table-bordered">

                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Principal Paid</th>
                                    <th>Interest Charged</th>
                                    <th>Total Payment</th>
                                    <th>Balance</th>
                                    {{#if ../isAdmin}}
                                    <th>Action</th>
                                    {{/if}}
                                </tr>
                            </thead>

                            <tbody>

                                {{#each this.timelines}}

                                {{#ifNotEqual status 'Credited'}}
                                <tr class="
                                        {{#ifEqual status 'Deducted'}}table-success{{/ifEqual}}
                                        {{#ifEqual status 'Skipped'}}table-warning{{/ifEqual}}
                                    ">
                                    <td>{{monthLabel}}</td>
                                    <td>₹ {{principalPaid}}</td>
                                    <td>₹ {{interestCharged}}</td>
                                    <td>₹ {{amount}}</td>
                                    <td>₹ {{balance}}</td>
                                    {{#if ../../isAdmin}}
                                    <td>
                                        {{#ifEqual status 'Deducted'}}
                                        <button class="btn btn-xs btn-warning action" data-action="skipEmi"
                                            data-id="{{id}}" disabled>
                                            Skip
                                        </button>
                                        {{/ifEqual}}
                                        {{#ifEqual status 'Pending'}}
                                        <button class="btn btn-xs btn-warning action" data-action="skipEmi"
                                            data-id="{{id}}" >
                                            Skip
                                        </button>
                                        {{/ifEqual}}
                                    </td>
                                    {{/if}}
                                </tr>
                                {{/ifNotEqual}}
                                {{/each}}

                            </tbody>

                        </table>

                    </div>
                </div>
                {{/each}}
                {{else}}
                <p>No loan found for selected filter.</p>
                {{/if}}
            </div>


        </div>


    </div>



    <div class="list">
        {{{list}}}
    </div>

    <div class="list-footer clearfix">
        {{{footer}}}
    </div>
</div>