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
            <div class="payslip-heading">Payslip</div>
            <!-- Dropdown for "Package & Proration" -->
            <div class="dropdown--wrapper">
                <button class="dropdown--toggle" id="dropdownBtn">Package & Proration</button>
                <div class="dropdown--list">
                    <a href="#CPackage">Package & Proration ▼</a>
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

            <label><b>Filter by Employee</b></label>

            <select id="employeeFilter" class="form-control">

                <option value="">All Employees</option>

                {{#each employeeList}}
                <option value="{{id}}" {{#ifCond id ../selectedEmployee}}selected{{/ifCond}}>
                    {{name}}
                </option>
                {{/each}}

            </select>

        </div>

        {{/if}}
        <div class="tabs-wrapper">
            {{#each formattedMonths}}
            <button class="tabs-btn" data-id="{{id}}">
                {{label}}
            </button>
            {{/each}}
        </div>


        <!-- Payslip Details Section -->
        <div class="details-section">

            <div class="detail-item">
                <label>Amount Credited</label>
                <span>₹{{selectedPayslip.attributes.amountCredited}}</span>
            </div>

            <div class="detail-item">
                <label>Total Work Days</label>
                <span>{{selectedPayslip.attributes.totalWorkDays}}</span>
            </div>

            <div class="detail-item">
                <label>Gross Pay</label>
                <span>₹{{selectedPayslip.attributes.grossPay}}</span>
            </div>

            <div class="detail-item">
                <label>Total Deductions</label>
                <span>₹{{selectedPayslip.attributes.totalDeductions}}</span>
            </div>

        </div>
        <!-- Footer Section -->
        <div class="footer-section">
            <button class="view-btn" data-action="showModal">View</button>
            <button class="download-btn" data-action="downloadPayslip">Download</button>
        </div>
    </div>

    <div class="list">
        {{{list}}}
    </div>

    <div class="list-footer clearfix">
        {{{footer}}}
    </div>

</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>