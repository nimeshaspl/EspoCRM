<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    .horizontal--navbar--container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: transparent;
        height: 45px;
        overflow-y: scroll;
        scrollbar-width: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .horizontal--navbar--item {
        margin: 0 10px;
        padding: 10px 15px;
        height: 100%;
        transition: background-color 0.3s ease;
        white-space: nowrap;
    }

    .horizontal--navbar--item a {
        text-decoration: none;
        color: #333;
    }

    .active--tab {
        border-bottom: 2px solid #007BFF;
    }

    .active--tab a {
        color: #007BFF;
    }
</style>

<div class="horizontal--navbar--container">
        <div class="horizontal--navbar--item">
            <a href="#" data-entity="CPackage">Employee Payroll Details</a>
        </div>
        <div class="horizontal--navbar--item">
            <a href="#" data-entity="CDashboard">Payroll dashboard</a>
        </div>
        <div class="horizontal--navbar--item">
            <a href="#" data-entity="CReports">Salary Advances</a>
        </div>
        <div class="horizontal--navbar--item">
            <a href="#" data-entity="CPayroll">Loans</a>
        </div>
        <div class="horizontal--navbar--item">
            <a href="#" data-entity="CDashboard">Extra Payment</a>
        </div>
        <div class="horizontal--navbar--item">
            <a href="#" data-entity="CReports">Employee VPF</a>
        </div>
        <div class="horizontal--navbar--item">
            <a href="#" data-entity="CPayroll">Non-payroll income</a>
        </div>
        <div class="horizontal--navbar--item">
            <a href="#" data-entity="CDashboard">Payroll Exceptions</a>
        </div>
        <div class="horizontal--navbar--item">
            <a href="#" data-entity="CReports">Variance</a>
        </div>
    </div>