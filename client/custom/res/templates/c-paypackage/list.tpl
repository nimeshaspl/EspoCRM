<style>
    .list{
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
                <a href="#CPackage" >Package & Proration  ▼</a>
                <a href="#CPayslip" >Payslip</a>
                <a href="#taxSheet" >Tax sheet</a>
                <a href="#salaryAdvance" >Salary advance</a>
                <a href="#loan" >Loan</a>
                <a href="#extraPayment" >Extra payment</a>
                <a href="#extraDeduction" >Extra deduction</a>
                <a href="#flexibleBenefitPlan" >Flexible benefit plan</a>
                <a href="#itDeclarationSubmission" >IT declaration & submission</a>
                <a href="#incomeTax" >Income tax</a>
                <a href="#form12B" >Form 12B</a>
                <a href="#overtimePayment" >Overtime Payment</a>
                <a href="#annualPayslip" >Annual Payslip</a>
                <a href="#perquisite" >Perquisite</a>
            </div>
        </div>
    </div>
    <div class="tabs-wrapper">
        <button class="tabs-btn">December 2025</button>
        <button class="tabs-btn">January 2026</button>
        <button class="tabs-btn">November 2025</button>
        <button class="tabs-btn">October 2025</button>
    </div>


    <!-- Payslip Details Section -->
    <div class="details-section">
        <div class="detail-item">
            <label>Amount credited</label>
            <span>₹0</span>
        </div>
        <div class="detail-item">
            <label>Total work days</label>
            <span>31</span>
        </div>
        <div class="detail-item">
            <label>Gross pay</label>
            <span>₹0</span>
        </div>
        <div class="detail-item">
            <label>TDS</label>
            <span>₹0</span>
        </div>
        <div class="detail-item">
            <label>Total deductions</label>
            <span>₹200</span>
        </div>
    </div>

    <!-- Footer Section -->
    <div class="footer-section">
        <button class="view-btn">View</button>
        <button class="download-btn">Download</button>
    </div>
</div>

        <div class="list">
            {{{list}}}
        </div>

        <div class="list-footer clearfix">
            {{{footer}}}
        </div>

    </div>

