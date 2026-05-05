<style>
    .wrapper {
        width: 100%;
        margin: 12px auto;
        background: #fff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

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
        padding: 0 0 var(--vertical-gap);
        display: flex;
        justify-content: space-between;
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

<div class="wrapper">
    {{#if isAdmin}}
    <div class="btn-container">


        <div class="panel panel-default" style="padding:10px;margin-bottom:15px;min-width: 320px;">
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
        <div>
            <a class="btn btn-primary action" data-action="createAttendanceUpdate">
                <span>Create Attendance</span>
            </a>
            <button id="createEmployeeBtn" class="btn btn-primary">
                Run Create Employees Service
            </button>
        </div>
    </div>
    {{/if}}
    {{#if isEmployee}}
    <div style="display: flex;justify-content: space-between;margin: 12px 0px;">
        <div>
            <h3>Attendance</h3>
        </div>
        <div style="margin: 12px 0px;justify-content: end;gap: 20px;">
            <a class="btn btn-primary action" data-action="attendanceUpdate">
                <span>Attendance Update</span>
            </a>
            <a class="btn btn-success action hidden" data-action="clockIn">
                <span>Clock In</span>
            </a>

            <a class="btn btn-danger action hidden" data-action="clockOut">
                <span>Clock Out</span>
            </a>

        </div>
    </div>
    {{/if}}

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
                <p>Working Days : {{totalWorkingDays}}</p>
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
    <table class="table">
        <thead>
            <tr>
                {{#if isAdmin}}
                <th>Employee</th>
                {{/if}}
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Total Hours</th>
                <th>Status</th>
                {{#if isAdmin}}
                <th>Action</th>
                {{/if}}
            </tr>
        </thead>
        <tbody>
            {{#each attendanceList}}
            <tr>
                {{#if ../isAdmin}}
                <td>{{this.employeeName}}</td>
                {{/if}}
                <td>{{this.date}}</td>
                <td>{{this.clockInTime}}</td>
                <td>{{this.clockOutTime}}</td>
                <td>{{this.totalHours}}</td>
                <td>{{this.status}}</td>
                {{#if ../isAdmin}}
                <td>
                    {{#if this.isToday}}
                    <!-- Disabled state for today's record -->
                    <a role="button" tabindex="-1" class="btn btn-default btn-xs-wide disabled"
                        style="pointer-events: none; opacity: 0.5;" title="Cannot edit today's attendance">
                        <i class="fa fa-edit" style="font-size:24px"></i>
                    </a>
                    {{else}}
                    <!-- Normal edit button -->
                    <a role="button" tabindex="0" class="btn btn-danger btn-xs-wide action" data-action="editAttendance"
                        data-id="{{id}}">
                        <i class="fa fa-edit" style="font-size:24px"></i>
                    </a>
                    {{/if}}
                </td>
                {{/if}}
            </tr>
            {{/each}}
        </tbody>
    </table>


</div>