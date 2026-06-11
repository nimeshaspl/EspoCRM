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
        padding: 5px 10px;
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

    .view-sheet {
        padding: 5px 10px;
        margin-left: 10px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        background-color: #d3e2f4;
        color: #007BFF;
        font-size: 16px;
    }

    .delete-btn {
        padding: 5px 10px;
        margin-left: 10px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        background-color: #f28c8c;
        color: #a70000;
        font-size: 16px;
    }

    .month-tab.active {
        background-color: #007BFF;
        color: white;
    }

    /* Payroll Page */
    .payroll--container,
    .run--payroll--container {
        background-color: white;
        margin: 20px 0;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        min-height: 700px;
    }

    .payroll-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #eee;
    }

    .payroll-header h4 {
        margin: 0;
        font-size: 18px;
        color: #333;
    }

    .payroll-header .fa {
        margin-left: 15px;
        cursor: pointer;
    }

    .payroll--section {
        display: flex;
        justify-content: space-between;
        padding: 20px;
    }

    .payroll--section p {
        font-size: 16px;
        color: #555;
        margin-bottom: 20px;
    }

    .sub--section {
        display: grid;
        grid-template-columns: repeat(2, minmax(150px, 1fr));
        gap: 20px;
    }

    .detail--card {
        display: flex;
        align-items: center;
        gap: 25px;
    }

    .detail--card i {
        font-size: 30px;
    }

    .button--container {
        display: flex;
        justify-content: space-between;
        padding: 20px;
    }
</style>

{{#if isAdmin}}
<div class="list-container">
    <div class="payroll--container">
        <div class="payroll-header">
            <div style="display: flex; align-items: center;">
                <h4>Payroll Data overview </h4>
                <i class="fa fa-refresh refresh--btn"></i>
                <i class="fa fa-file"></i>
            </div>
            <div>
                Salary Cycle: <span>2-2026</span>
            </div>
        </div>
        <div class="payroll--section">
            <div>
                <p>You are viewing the Payroll Data overview and salary sheet for the salary cycle 2-2026.</p>
                <div class="sub--section">
                    <div class="detail--card">
                        <div>
                            <i class="fa fa-users"></i>
                        </div>
                        <div>
                            <h4 id="employee-count">{{latestPayroll.totalEmployees}}</h4>
                            <p> Employees Count</p>
                        </div>
                    </div>
                    <div class="detail--card">
                        <div>
                            <i class="fa fa-users"></i>
                        </div>
                        <div>
                            <h4>{{latestPayroll.wageAmount}}</h4>
                            <p>Wage Amount</p>
                        </div>
                    </div>
                    <div class="detail--card">
                        <div>
                            <i class="fa fa-users"></i>
                        </div>
                        <div>
                            <h4>{{latestPayroll.salaryPayout}}</h4>
                            <p> Salary payout</p>
                        </div>
                    </div>
                    <div class="detail--card">
                        <div>
                            <i class="fa fa-users"></i>
                        </div>
                        <div>
                            <h4>{{latestPayroll.taxPayment}}</h4>
                            <p> Tax Payment</p>
                        </div>
                    </div>
                    <div class="detail--card">
                        <div>
                            <i class="fa fa-users"></i>
                        </div>
                        <div>
                            <h4>{{latestPayroll.pTGross}}</h4>
                            <p>PT(Gross)</p>
                        </div>
                    </div>

                </div>
            </div>
            <div>
                <img src="client/img/girlEmployee1.png" alt="default image" style="width: 300px; height: auto;">
            </div>
        </div>
        <div class="button--container">
            <div>
                <button class="view-sheet view--salary--sheet--btn">View Salary Sheet</button>
                <button class="view-sheet bank--sheet--btn">Bank Sheet</button>
                <button class="delete-btn delete--payslip--btn">Delete Payslip</button>
                <button class="delete-btn delete--payroll--data--btn">Delete Payroll Data</button>
                <button class="view-btn close--payroll--btn">Close Payroll</button>
            </div>
            <div>
                <button class="view-btn generate--payslip--btn">Generate Payslip</button>
                <a href="#CRunPayroll" class="view-btn run--payroll--btn">
                    Run Payroll
                </a>
            </div>
        </div>
    </div>
</div>


<!-- Side modal Modal  -->


{{else}}

<div class="list-container">
    <h3>404 not found</h3>
</div>


{{/if}}