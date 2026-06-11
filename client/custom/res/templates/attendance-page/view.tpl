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

    /* ── PAGINATION ── */
    .lm-pagination-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 8px;
        padding: 8px 14px;
        background: #f7f9fc;
        border: 1px solid rgba(0, 0, 0, .08);
        border-radius: 8px 8px 0 0;
        border-bottom: 2px solid #e2e8f0;
    }

    /* When pagination is ABOVE the table, remove bottom radius so it flows into the table */
    .lm-pagination-bar+.lm-table-wrap {
        border-top: none;
        border-radius: 0 0 8px 8px;
        margin-bottom: 22px;
    }

    .lm-pagination-left,
    .lm-pagination-right {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .lm-pagination-label {
        font-size: 11.5px;
        font-weight: 600;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: .4px;
        margin: 0;
        white-space: nowrap;
    }

    .lm-pagination-select {
        height: 28px;
        padding: 0 8px;
        border: 1px solid #e2e8f0;
        border-radius: 5px;
        background: #fff;
        color: #1a2233;
        font-size: 12.5px;
        font-weight: 500;
        cursor: pointer;
        transition: border-color .15s;
        min-width: 64px;
    }

    .lm-pagination-select:focus {
        outline: none;
        border-color: #2f5ea7;
        box-shadow: 0 0 0 2px rgba(47, 94, 167, .12);
    }

    .lm-pagination-info {
        font-size: 12px;
        color: #64748b;
        font-weight: 500;
        background: #eef2f7;
        padding: 3px 8px;
        border-radius: 4px;
        white-space: nowrap;
    }

    .lm-page-count {
        font-size: 12px;
        color: #475569;
        font-weight: 600;
        white-space: nowrap;
    }

    .lm-page-btn {
        width: 28px;
        height: 28px;
        border: 1px solid #e2e8f0;
        background: #fff;
        color: #2f5ea7;
        border-radius: 5px;
        cursor: pointer;
        font-size: 15px;
        font-weight: 700;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all .15s ease;
        flex-shrink: 0;
    }

    .lm-page-btn:hover:not([disabled]) {
        background: #2f5ea7;
        color: #fff;
        border-color: #2f5ea7;
        box-shadow: 0 1px 4px rgba(47, 94, 167, .25);
    }

    .lm-page-btn:active:not([disabled]) {
        transform: scale(.93);
    }

    .lm-page-btn[disabled] {
        opacity: .35;
        cursor: not-allowed;
        color: #94a3b8;
        background: #f8fafc;
        border-color: #e2e8f0;
    }

    /* ── SUB HEADING above pagination — tighten spacing ── */
    .lm-sub-heading {
        margin: 0 0 8px;
    }

    @media (max-width: 640px) {
        .lm-pagination-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
        }

        .lm-pagination-right {
            width: 100%;
            justify-content: space-between;
        }
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

    <div class="lm-pagination-bar">
        <div class="lm-pagination-left">
            <label class="lm-pagination-label">Rows per page</label>
            <select class="lm-pagination-select action" data-action="changePageSize" data-key="attendanceList">
                {{#each attendancePager.sizeOptions}}
                <option value="{{value}}" {{#if selected}}selected{{/if}}>{{label}}</option>
                {{/each}}
            </select>
        </div>

        <div class="lm-pagination-right">
            <span class="lm-pagination-info">
                {{#if attendancePager.total}}
                {{attendancePager.start}}–{{attendancePager.end}} of {{attendancePager.total}}
                {{else}}
                0–0 of 0
                {{/if}}
            </span>

            <button class="lm-page-btn action" data-action="prevPage" data-key="attendanceList" {{#unless
                attendancePager.hasPrev}}disabled{{/unless}}>
                ‹
            </button>

            <span class="lm-page-count">
                Page {{attendancePager.page}} / {{attendancePager.totalPages}}
            </span>

            <button class="lm-page-btn action" data-action="nextPage" data-key="attendanceList" {{#unless
                attendancePager.hasNext}}disabled{{/unless}}>
                ›
            </button>
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
                    <a role="button" tabindex="-1" class="btn btn-default btn-xs-wide disabled"
                        style="pointer-events:none; opacity:0.5;" title="Cannot edit today's attendance">
                        <i class="fa fa-edit" style="font-size:24px"></i>
                    </a>
                    {{else}}
                    <a role="button" tabindex="0" class="btn btn-danger btn-xs-wide action" data-action="editAttendance"
                        data-id="{{id}}">
                        <i class="fa fa-edit" style="font-size:24px"></i>
                    </a>
                    {{/if}}
                </td>
                {{/if}}
            </tr>
            {{/each}}
            {{^attendanceList}}
            <tr>
                <td colspan="{{#if isAdmin}}7{{else}}5{{/if}}"
                    style="text-align:center; color:#94a3b8; padding:28px; font-style:italic;">
                    No attendance records found
                </td>
            </tr>
            {{/attendanceList}}
        </tbody>
    </table>


</div>