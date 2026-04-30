<style>
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

    .dropdown--toggle::after {
        content: " ▼";
        font-size: 10px;
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

    /* Pack Sub Section CSS */
    .pack-sub-section {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
    }

    .left-section {
        /* background-color: #651cee; */
        width: 30%;
        padding: 15px;
        border-radius: 5px;
    }

    .right-section {
        flex: 1;
        /* background-color: #cc1f1f; */
        padding: 15px;
        border-radius: 5px;
    }

    table {
        width: 90%;
        border-collapse: collapse;
        margin-top: 15px;
    }

    .dt-thead {
        background-color: rgb(195 195 233);
        border: 1px solid #ccc;
    }

    .date-tab-container {
        display: flex;
        overflow: scroll;
        scrollbar-width: none;
    }

    .date-tab-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15px;
        font-size: 15px;
        background-color: #460bda;
        color: white;
        border: 1px solid #ccc;
        padding: 8px 16px;
        margin-right: 10px;
        border-radius: 5px;
        cursor: pointer;
    }

    .details-section {
        margin-top: 20px;
    }

    .detail-item {
        display: flex;
        flex-direction: column;
    }

    .detail-item label {
        font-weight: bold;
        color: black;
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

    <div class="payroll-wrapper mb-4">
        <!-- Header Section -->
        <div class="payroll-header">
            <div class="payslip-heading">Package & Proration</div>
            <!-- Dropdown for "Package & Proration" -->
            <div class="dropdown--wrapper">
                <button class="dropdown--toggle" id="dropdownBtn">Package & Proration</button>
                <div class="dropdown--list">
                    <a href="#CPackage">Package & Proration</a>
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
        <select id="employee-filter" style="margin-left:15px;padding:6px;">
            <option value="">All Employees</option>

            {{#each employees}}
            <option value="{{id}}" {{#ifCond id ../selectedEmployee}}selected{{/ifCond}}>
                {{name}}
            </option>
            {{/each}}

        </select>
        {{/if}}
        <div class="pack-sub-section">
            <div class="left-section">
                <div class="date-tab-container">
                    {{#each formattedModels}}
                    <button class="date-tab-btn" data-id="{{id}}">
                        <span>{{day}}</span> {{monthYear}}
                    </button>
                    {{/each}}
                </div>
                <div class="details-section">
                    <div class="detail-item">
                        <label>Assigned CTC</label>
                        <span>₹{{assignedCTC}}</span>
                    </div>
                    <div class="detail-item">
                        <label>Assigned by</label>
                        <span>
                            {{payPackageData.createdByName}}
                        </span>
                    </div>

                </div>
            </div>
            <div class="right-section">
                <h4>Pay Package Details</h4>
                {{#if selectedPackage}}
                <table>
                    <tr>
                        <td>Updated on</td>
                        <td class="text-right">{{selectedPackage.attributes.updatedOn}}</td>
                    </tr>
                    <tr>

                        <td>Effective from</td>
                        <td class="text-right">{{selectedPackage.attributes.effectiveFrom}}</td>

                    </tr>
                    <tr>

                        <td>Salary structure</td>
                        <td class="text-right">Std Salary Structure</td>
                    </tr>
                    <tr>

                        <td>Designation</td>
                        <td class="text-right">{{employee.workRoleName}}</td>
                    </tr>
                    <tr>

                        <td>Assigned on</td>
                        <td class="text-right">DOJ</td>
                    </tr>

                </table>
                <h4>Pay package proration</h4>
                <table>
                    <thead class="dt-thead">
                        <tr>
                            <th>Income component</th>
                            <th class="text-center">Annual proration</th>
                            <th class="text-center">Monthly proration</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Basic Pay</td>
                            <td class="text-center">₹{{payPackageData.basicPay}}</td>
                            <td class="text-center">₹{{monthlyData.basicPay}}</td>
                        </tr>
                        <tr>
                            <td>Conveyance Allowance</td>
                            <td class="text-center">₹{{payPackageData.conveyanceAllowance}}</td>
                            <td class="text-center">₹{{monthlyData.conveyanceAllowance}}</td>
                        </tr>
                        <tr>
                            <td>HRA (Gross)</td>
                            <td class="text-center">₹{{payPackageData.hRAGross}}</td>
                            <td class="text-center">₹{{monthlyData.hRAGross}}</td>
                        </tr>
                        <tr>
                            <td>Medical</td>
                            <td class="text-center">₹{{payPackageData.medical}}</td>
                            <td class="text-center">₹{{monthlyData.medical}}</td>
                        </tr>
                        <tr>
                            <td>Special Allowance</td>
                            <td class="text-center">₹{{payPackageData.specialAllowance}}</td>
                            <td class="text-center">₹{{monthlyData.specialAllowance}}</td>
                        </tr>
                        <tr>
                            <td>Balancing Figure</td>
                            <td class="text-center">₹{{payPackageData.balancingFigure}}</td>
                            <td class="text-center">₹{{monthlyData.balancingFigure}}</td>
                        </tr>
                    </tbody>

                </table>
                <table>
                    <thead class="dt-thead">
                        <tr>
                            <th>Deduction component</th>
                            <th class="text-center">Annual proration</th>
                            <th class="text-center">Monthly proration</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>PT (Gross)</td>
                            <td class="text-center">₹{{payPackageData.pTGross}}</td>
                            <td class="text-center">₹{{monthlyData.pTGross}}</td>
                        </tr>
                </table>
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