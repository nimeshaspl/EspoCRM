<style>
    .pull-right {
        display: hidden;
    }


    .attendance-summary {
        margin: 20px 0;
    }

    .attendance-top {
        background: #e8f5e9;
        padding: 10px 15px;
        border-radius: 6px;
        margin-bottom: 15px;
        display: flex;
        justify-content: space-between;
        font-weight: 600;
    }

    .attendance-cards {
        display: flex;
        gap: 15px;
        margin-bottom: 20px;
    }

    .card-box {
        flex: 1;
        background: #f7f7f7;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #ddd;
    }

    /* Top buttons */
    .btn-container {
        display: flex;
        justify-content: space-around;
        align-items: center;
    }

    .top-btns {
        background-color: transparent;
        color: #6262a3;
        border: 1px solid #6262a3;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.3s ease;
        height: 50px;
        width: 300px;
    }
</style>

<div class="list-container">

    {{#if isAdmin}}
    <div class="list-header clearfix">
        {{{header}}}
    </div>
     <div class="search-container">
        {{{search}}}
    </div>
    <div class="button-container clearfix">
        {{{buttons}}}
    </div>
    <div class="panel panel-default" style="padding:10px;margin-bottom:15px;">
        <label><strong>Filter by Employee:</strong></label>
        <select id="employeeFilter" class="form-control">
            <option value="">All Employees</option>
            {{#each employeeList}}
            <option value="{{id}}" {{#if selected}}selected{{/if}}>
                {{name}}
            </option>
            {{/each}}
        </select>

    </div>
    {{/if}}

   {{#ifEqual isAdmin false}}
    <div style="display: flex;justify-content: space-between;margin: 12px 0px;">
        <div>
        <h3>Attendance</h3>
    </div>
    <div style="margin: 12px 0px;justify-content: end;gap: 20px;">
        <a role="button" tabindex="0" class="btn btn-success btn-xs-wide main-header-manu-action action"
            data-name="clockIn" data-action="clockIn">
            <span>Clock In</span>
        </a>
        <a role="button" tabindex="0" class="btn btn-danger btn-xs-wide main-header-manu-action action hidden"
            data-name="clockOut" data-action="clockOut">
            <span>Clock Out</span>
        </a>
    </div>
    </div>
    {{/ifEqual}}


    <div class="btn-container">
        <button class="top-btns" data-action="clockInRequest">CLOCK-IN REQUEST</button>
        <button class="top-btns" data-action="attendanceUpdate">ATTENDANCE UPDATE</button>
        <button class="top-btns">Advanced options <i class="fa fa-cog"></i></button>
    </div>

    <div class="attendance-summary">

        <div class="attendance-top">
            <span>Present Days → <b>{{presentDays}}</b></span>
            <span>Absent Days → <b>{{absentDays}}</b></span>
        </div>

        <div class="attendance-cards">
            <div class="card-box">
                <h4>Overview</h4>
                <p>Present Days : {{presentDays}}</p>
                <p>Leave Days : {{leaveDays}}</p>
                <p>Absent Days : {{absentDays}}</p>
                <p>Leave Hours : {{leaveHours}}</p>
            </div>

            <div class="card-box">
                <h4>Total Duration</h4>
                <p>Work Duration: {{totalWork}}</p>
                <p>Overtime : {{totalOt}}</p>
            </div>

            <div class="card-box">
                <h4>Average Duration</h4>
                <p>Work Duration : {{avgWork}}</p>
                <p>Overtime : {{avgOt}}</p>
            </div>
        </div>

    </div>
    <button class="btn btn-danger" data-action="truncateTable">
    Truncate Table
</button>

    <div class="list">
        {{{list}}}
    </div>

    <div class="list-footer clearfix">
        {{{footer}}}
    </div>

</div>